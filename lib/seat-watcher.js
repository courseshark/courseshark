var cronJob = require('cron').CronJob
, crawler = require('./crawler')
, TwilioClient = require('twilio').Client
, twilio
,	MandrillAPI = require('mailchimp').MandrillAPI
, mandrill
, outgoingNumber = ''
, sendNotification
, run
, ejs = require('ejs')
, fs = require('fs')
, seatMessage = function(){return'[error]'}
, app

sendNotification = function(notification, settings){
	var seats = settings['seats'] || 'unknown'
	, waitlist = !!settings['waitlist'] || false
	, number = notification.phone.replace(/[^0-9]/g, '')
	, mailOptions

	if ( number.length >= 10 && notification.sent===false ){
		var message = "We found "+seats+" "+(waitlist?"waitlist ":"")+"seats open in "+notification.section.name
		, to = number
		twilio.sendSms(outgoingNumber, to, message, false, function(info){
			notification.smsInfo.splice(0,0,info['sid'])
			notification.sent = true
			notification.lastSent = Date.now()
			notification.save();
		})
	}else{
		// Send email

		
		// mailOptions = {
		//  from: "Seat Watcher <alert@courseshark.com>"
		//  , to: notification.email
		//  , subject: "Seat Watcher Alert"
		//  , text: seats+" open in "+notification.section.name
		//  , html: seatMessage({
		//      removeLink: 'http://'+app.config.domain+'/email/remove/'+notification.user.id+'/'+notification.id+'/'+notification.section.id
		//    , user: notification.user
		//    , isWaitlist: waitlist
		//    , seats: seats
		//    , sectionName: notification.section.name
		//    , now: (new Date(notification.section.updated)).toTimeString()
		//    , domain: 'http://'+app.config.domain})
		// }
		// console.log(mailOptions.html)
		// //Something new
		// smtpTransport.sendMail(mailOptions, function(error, response){
		//  if(error){
		//    console.log(error);
		//  }else{
		//    notification.sent = true
		//    notification.lastSent = Date.now()
		//    notification.save();
		//  }
		// })

		seats = waitlist?notification.section.waitSeatsAvailable:notification.section.seatsAvailable
		pluralize = (seats===1)?'seat':'seats'
		seatsTxt = seats + (waitlist?' waitlist ':' ') + pluralize
		mandrill.messages_send_template({
				template_name:'notification_seats'
			, template_content:''
			, message:{
					subject: 'SeatWatcher Alert'
				, from_email: 'alert@courseshark.com'
				, from_name: 'CourseShark SeatWatcher'
				, track_opens: true
				, track_clicks: true
				, auto_txt: true
				, to: [{name: notification.user.name, email: notification.email}]
				, template_content: []
				, global_merge_vars:[
						{name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
					, {name: 'SUBJECT', content: 'SeatWatcher'}
					, {name: 'NOW', content: (new Date(notification.section.updated)).toTimeString()}]
				, merge_vars:[{
						rcpt: notification.email
					, vars:[
							{name: 'FNAME', content: notification.user.firstName}
						, {name: 'SECTION', content: notification.section.name}
						, {name: 'SEAT_TEXT', content: seatsTxt}
						, {name: 'REMOVE_LINK', content: 'http://'+app.config.domain+'/notification/remove/'+notification.user.id+'/'+notification.id+'/'+notification.section.id}]
					}]
				, tags: ['notification', (waitlist?'waitlist':'seat')]
				}
			}, function (data){
				if ( data.status == 'error' ){
					console.log(data)
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

	// DPRECATED
	// smtpTransport = nodemailer.createTransport("SMTP",{
	//  service: "Gmail",
	//  auth: {
	//    user: app.config.email.notification.account
	//  , pass: app.config.email.notification.pass
	// }})

	try {
		mandrill = new MandrillAPI(app.config.email.mandrillKey, { version : '1.0', secure: false });
	} catch (error) {
		console.log('Mandrill Error: ' + error);
	}

	app.notifications = {}

	// Setup each school
	School.find({enabled: true, notifications: true}, function(err, schools){
		if ( err ){console.error(err)}
		for ( var i=0,len=schools.length; i<len; i++ ){
			school = schools[i]
			startSchool(school)
		}
	})
}

exports.startSchool = startSchool = function(school){
	console.log('[CRON] Setup for '+school.abbr+'\t| Rule '+school.notificationCron);
	app.notifications[school.abbr] = new cronJob({
		cronTime: school.notificationCron
		, onTick: function(){run(app, school)}
		, start: true
	});
	app.notifications[school.abbr].start()
}

exports.stopSchool = stopSchool = function(school){
	if ( !app.notifications[school.abbr] ){
		console.log('[CRON] School '+school.abbr+' cannot stop before start');
		return;
	}
	console.log('[CRON] Stopping '+school.abbr);
	app.notifications[school.abbr].stop()
}



run = function(app, school){
	var seats = app.io.of('/seats')
	, onUpdate
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
	.exec(function(err, notifications){
		for(var i=0,len=notifications.length; i<len; i++){
			notification = notifications[i]
			crawler[school.abbr].safeUpdateSection(notification.section, 15*60*1000, onUpdate(notification))
		}
	})
}
