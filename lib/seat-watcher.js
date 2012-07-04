var cronJob = require('cron').CronJob
	,	crawler = require('./crawler')
	, nodemailer = require("nodemailer")
	, TwilioClient = require('twilio').Client
	, twilio
	, smtpTransport
	, outgoingNumber = ''
	, sendNotification
	, run
	, ejs = require('ejs')
	, fs = require('fs')
	, seatMessage = function(){return'[error]'}
	, app

sendNotification = function(notification, settings){
	var seats = settings['seats'] || 'unknown'
		,	waitlist = !!settings['waitlist'] || false
		,	number = notification.phone.replace(/[^0-9]/g, '')
		, mailOptions

	if ( number.length >= 10 && notification.sent===false ){
		var message = "We found "+seats+" "+(waitlist?"waitlist ":"")+"seats open in "+notification.section.name
			,	to = number
		twilio.sendSms(outgoingNumber, to, message, false, function(info){
			notification.smsInfo.splice(0,0,info['sid'])
			notification.sent = true
			notification.lastSent = Date.now()
			notification.save();
		})
	}else{
		// Send email
		seats = waitlist?notification.section.waitSeatsAvailable:notification.section.seatsAvailable
		mailOptions = {
				from: "Seat Watcher <alert@courseshark.com>"
			,	to: notification.email
			,	subject: "Seat Watcher Alert"
			,	text: seats+" open in "+notification.section.name
			,	html: seatMessage({
									removeLink: 'http://'+app.config.domain+'/email/remove/'+notification.user.id+'/'+notification.id+'/'+notification.section.id
								, user: notification.user
								, isWaitlist: waitlist
								, seats: seats
								, sectionName: notification.section.name
								, now: (new Date(notification.section.updated)).toTimeString()
								, domain: 'http://'+app.config.domain})
		}
		console.log(mailOptions.html)
		//Something new
		smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
			}else{
				notification.sent = true
				notification.lastSent = Date.now()
				notification.save();
			}
		})
	}
}

exports.boot = function(a){
	app = a
	twilio = new TwilioClient(app.config.twilio.sid, app.config.twilio.authToken, app.config.domain)
	outgoingNumber = app.config.twilio.outgoing
	smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Gmail",
		auth: {
			user: app.config.email.notification.account
		,	pass: app.config.email.notification.pass
	}})

	// Template
	fs.readFile(__dirname+'/views/email/notifications/seat.ejs', 'ascii', function(err, text){
		if ( err ){ console.error(err);}
		seatMessage = text?ejs.compile(text):(function(err){return function(){return err}})(err)

		// Setup each school
		School.find({enabled: true, notifications: true}, function(err, schools){
			if ( err ){console.error(err)}
			for ( var i=0,len=schools.length; i<len; i++ ){
				school = schools[i]
				console.log('[CRON] Setup for '+school.abbr+' | Rule '+school.notificationCron);
				job = new cronJob({
						cronTime: school.notificationCron
					,	onTick: (function(school) {
											return function(){run(app, school)}
										})(school)
					,	start: true
				});
				job.start()
			}
		})
	})
	

}

run = function(app, school){
	var seats = app.io.of('/seats')
		,	onUpdate
	onUpdate = function(notification){
		return function(err, section){
			// Emit the new seating information to the sockets
			seats.emit('result', {id: section.id, avail: section.seatsAvailable, total: section.seatsTotal, section: section})
			
			historyI = notification.history.length - 1;
			// Check the section to see if we need to notify the user
			if ( notification.waitlist && section.waitSeatsAvailable > 0 ){
				if ( section.waitSeatsAvailable > 0 && section.waitSeatsAvailable != notification.history[historyI] ){
					//send based on waitlist
					sendNotification(notification, {waitlist: true, seats: section.waitSeatsAvailable})
				}
				if ( section.waitSeatsAvailable != notification.history[historyI] || historyI===-1 ){
					notification.history.push(section.waitSeatsAvailable)
					notification.save(function(err){
						if ( err ){ console.error('Error updating notification history-',err); }
					})
				}
			}else{
				if ( section.seatsAvailable > 0 && section.seatsAvailable != notification.history[historyI] ){
					sendNotification(notification, {waitlist: false, seats: section.seatsAvailable})
				}
				// Update notification history
				if ( section.seatsAvailable != notification.history[historyI] || historyI===-1 ){
					notification.history.push(section.seatsAvailable)
					notification.save(function(err){
						if ( err ){ console.error('Error updating notification history',err,notification); }
					})
				}
			}
		}
	}

	Notification
		.find({hidden: false, deleted: false, school: school._id})
		.populate('section')
		.populate('school')
		.populate('user')
		.run(function(err, notifications){
			for(var i=0,len=notifications.length; i<len; i++){
				notification = notifications[i]
				crawler[school.abbr].safeUpdateSection(notification.section, 15*60*1000, onUpdate(notification))
			}
		})
}
