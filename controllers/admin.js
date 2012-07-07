/*
 * Admin controller
 */
var EventEmitter = require("events").EventEmitter
	,	seatWatcher = require('../lib/seat-watcher')

exports = module.exports = function(app){

	aio = app.io.of('/admin')

	// Admin dashboard
	app.get('/admin', requireAdmin, function(req, res){
		res.render('admin/index', {});
	})

	app.get('/admin/schools', requireAdmin, function(req, res){
		School.find({}).exec(function(err, schools){
			res.render('admin/schools/index', {schools: schools, layout:'../layout.ejs'});
		})
	})
	app.get('/admin/schools/:school/toggle-enabled', requireAdmin, function(req, res){
		res.json(true)
		School.findOne({_id:req.params.school}).exec(function(err, school){
			if (school){
				school.enabled = !school.enabled
				school.save(function(err){
				})
			}
		})
	})
	app.get('/admin/schools/:school/toggle-notifications', requireAdmin, function(req, res){
		res.json(true)
		School.findOne({_id:req.params.school}).exec(function(err, school){
			if (school){
				school.notifications = !school.notifications
				school.save(function(err){
					if ( school.notifications ){
						seatWatcher.startSchool(school)
					}else{
						seatWatcher.stopSchool(school)
					}
				})
			}
		})
	})


	app.get('/admin/users', requireAdmin, function(req, res){
		User.find(req.query.user).populate('school').exec(function(err, users){
			res.render('admin/users/index', {users: users, layout:'../layout.ejs'});
		})
	})

	app.get('/admin/links', requireAdmin, function(req, res){
		Link.find(req.query.link).populate('user').exec(function(err, links){
			res.render('admin/links/index', {links: links, layout:'../layout.ejs'});
		})
	})
	app.post('/admin/links', requireAdmin, function(req, res){
		console.log(req.body)
		link = new Link(req.body.link)
		console.log(link)
		link.save()
		res.redirect('/links')
	})

	app.delete('/admin/links/:linkId', requireAdmin, function(req, res){
		Link.findOne({_id: req.params.linkId}, function(err, link){
			if ( !err && link ){
				link.remove()
			}
			res.redirect('/links')
		})
	})

	app.get('/admin/launch', requireAdmin, function(req, res){
		School.find({}, {}, {sort:{abbr:1}}).exec(function(err, schools){
			res.render('admin/launch/index', {schools: schools, layout:'../layout.ejs'})
		})
	})

	app.get('/admin/launch/import', requireAdmin, function(req, res){
		res.render('admin/launch/import', {layout:false})
	})


	aio.on('connection', function(socket){
		var mysql = require('mysql')
			,	connection  = {}
			,	pauser = new EventEmitter()

		pauser.on('-', function(){
			if ( pauser.count===undefined || --pauser.count <= 0 ){
				socket.emit(pauser.doneTxt)
				pauser.count = 0
				pauser.next()
			}
		})


		function clearDB(userToNotRemove, cb){
			userToNotRemove.major = undefined;
			userToNotRemove.save();
			pauser.doneTxt = 'drop-confirmed'
			pauser.next = connectToMySQL
			User.remove({_id: {$ne: userToNotRemove._id}}, function(err){
				Schedule.remove({}, function(err){
					Notification.remove({}, function(err){
						ScheduleLink.remove({}, function(err){
							Credit.remove({}, function(err){
								pauser.emit('-')
							})
						})
					})
				})
			})
		}

		function connectToMySQL(){
			pauser.doneTxt = 'connection-confirmed'
			pauser.next = downloadUsers
			connection = mysql.createConnection({
				host     : 'courseshark.com',
				user     : 'importer',
				password : 'nodejs-importer'
			});
			connection.connect(function(err){
				if (err) throw err;
				pauser.emit('-')
			})
		}

		function downloadUsers(){
			pauser.doneTxt = 'added-users'
			pauser.next = downloadSchools
			connection.query('SELECT `u`.*, group_concat(`_u`.id) as friends from `courseshark`.`users` as `u` LEFT JOIN `courseshark`.`friendships` as `f` ON `u`.id=`f`.user_id LEFT JOIN `courseshark`.`users` as `_u` ON `_u`.id=`f`.friend_id GROUP BY `u`.id; ', function(err, rawUsers, fields) {
				if (err) throw err;
				socket.emit('found-users', rawUsers)
				pauser.count = rawUsers.length
				for(var i=0,len=rawUsers.length; i<len; i++){
					(function (u){
						var user = {
								firstName: u.first_name
							,	lastName: u.last_name
							, email: u.email
							, oldId: u.id
							, oldSchool: u.school_id
							, oldMajor: u.major_id
							,	year: u.year
							, hashPassword: u.password
							, canEmailFriendRequests: !!u.can_email_friend_requests
							, autoAcceptFriends: !!u.auto_accept_friends
							, loginCount: u.login_count
							, lastLogin: new Date(u.last_login)
							, created: new Date(u.created)
							, modified: new Date(u.modified)
							,	admin: !!u.admin
							, oldFriends: u.friends?u.friends.split(',').map(function(e){return parseInt(e,10)}): undefined
							}
						if ( u.oauth_provider!=='none' && u.oauth_provider!=='' ){
							user.oauth = u.oauth_provider
						}
						if ( u.fb_uid && u.password === '' ){
							user.oauth = 'facebook'
						}
						var newUser = new User(user)
						newUser.save(function(err){
							pauser.emit('-')
						})
					})(rawUsers[i]);
				}
			}) // End DB.users
		}
		
		function downloadSchools(){
			pauser.doneTxt = 'added-schools'
			pauser.next = downloadSchedules
			connection.query('SELECT * from `courseshark`.`schools`;', function(err, rawSchools, fields) {
				if (err) throw err;
				socket.emit('found-schools', rawSchools)
				pauser.count = rawSchools.length
				rawSchools.forEach(function(rawSchool){
					upsertData = {	abbr: rawSchool.abbr
												,	name: rawSchool.name
												,	state: rawSchool.state
												,	city: rawSchool.city
												,	zip: rawSchool.zip
												, oldId: rawSchool.id
											}
					School.update({abbr: rawSchool.abbr}, upsertData, {upsert: true}, function(err, num){
						School.findOne({abbr: rawSchool.abbr}, function(err, school){
							User.update({oldSchool: rawSchool.id}, {$set:{school: school._id}, $unset:{oldSchool:1}}, {multi: true}, function(err, num){
								if ( err ) { console.log(err); }
								pauser.emit('-')
							})
						})
					})
				})
			})
		}

		function downloadSchedules(){
			pauser.doneTxt = 'added-schedules'
			pauser.next = downloadNotifications
			School.find({enabled: true, oldId: {$gte:1}}, function(err, schools){
				if ( err ){ console.log(err) }
				if ( !schools.length ){ console.error('School not enabled/found'); pauser.emit('-') }
				schools.forEach(function(school){
					sobj = school.toObject()
					schoolId = sobj.oldId
					db = school.abbr=='gatech'?'gt':school.abbr;
					query = 'select `s`.*, group_concat(`_s`.number) as crn from `courseshark`.`schedules` as `s` inner join `courseshark`.`schedule_sections` as `ss` on `ss`.schedule_id = `s`.id inner join `courseshark_'+db+'`.`sections` as `_s` on `_s`.id = `ss`.section_id where `s`.`school_id`='+schoolId+' group by `s`.id'
					connection.query(query, function(err, rawSchedules, fields) {
						if ( err || !rawSchedules ){ console.log ( err, query ); }
						socket.emit('found-schedules', rawSchedules.length)
						pauser.count = rawSchedules.length
						rawSchedules.forEach(function(rawSchedule){
							User.findOne({oldId:rawSchedule.user_id}, {_id:1}, function(err, user){
								if ( err ){ console.log(err) }
								if ( !user ){ console.error('No user found', rawSchedule); pauser.emit('-'); return;}
								Term.findOne({school:school._id, number:rawSchedule.term_id}, function(err, term){
									if ( err ){ console.log(err) }
									if ( !term ){ console.error('Term not enabled/found', term, {school:school._id, number:rawSchedule.term_id}); pauser.emit('-'); return; }
									var nlist = rawSchedule.crn.split(',').map(function(r){ return parseInt(r,10); })
									if ( nlist.length === 0 ){
										console.log('Empty schedule', rawSchedule);
										pauser.emit('-')
									}else{
										Section.find({term:term._id, number:{$in: nlist}}).populate('course').populate('department').exec(function(err, sections){
											schedule = new Schedule({name: rawSchedule.name, term: term._id, school: school._id, user: user._id, sections: sections})
											schedule.save(function(err){
												if ( err ){ console.log(err); }
												pauser.emit('-')
											})
										})// end section finder
									} // end check for sections in this schedule
								})// end term
							})// end user
						}) // End schedule foreach
					}) // End Query
				})// End School
			})// End Schools find
		}


		function downloadNotifications(){
			pauser.doneTxt = 'added-notifications'
			pauser.next = downloadNotificationFeedback
			School.find({enabled: true, oldId: {$gte:1}}, function(err, schools){
				if ( err ){ console.log(err) }
				if ( !schools.length ){ console.error('School not enabled/found'); pauser.emit('-') }
				schools.forEach(function(school){
					sobj = school.toObject()
					schoolId = sobj.oldId
					db = school.abbr=='gatech'?'gt':school.abbr;
					query = 'SELECT `cn`.* FROM `courseshark`.`caffeine_notifications` as `cn` WHERE `cn`.school_id='+schoolId+';'
					connection.query(query, function(err, rawNotifications, fields) {
						if ( err || !rawNotifications ){ console.log ( err, query ); pauser.emit('-'); return;}
						socket.emit('found-notifications', rawNotifications.length)
						pauser.count = rawNotifications.length
						rawNotifications.forEach(function(rawNotification){
							rawNotification.user_id = parseInt(rawNotification.user_id, 10)
							User.findOne({oldId:rawNotification.user_id}, {_id:1}, function(err, user){
								if ( err ){ console.log(err) }
								if ( !user ){ console.log('user not found', {oldId: rawNotification.user_id}); pauser.emit('-'); return;}
								Term.findOne({school:school._id, number:rawNotification.term_id}, function(err, term){
									if ( err ){ console.log(err) }
									if ( !term ){ pauser.emit('-'); return; }
									Section.findOne({term:term._id, number:rawNotification.section_number}, {_id:1}, function(err, section){
										if ( err ){ console.log(err) }
										if ( !section ){ console.log('section not found ', rawNotification); pauser.emit('-'); return;}

										notification = new Notification({
												user: user._id
											, section: section._id
											,	email: rawNotification.email
											, history: [rawNotification.last_seats]
											, sent: (rawNotification.sent==1)
											, deleted: (rawNotification.deleted==1)
											, hidden: (rawNotification.hidden==1)
											, school: school._id
										})
										notification.oldId = rawNotification.id
										if ( rawNotification.sms_email.match(/[0-9]+/) ){
											notification.phone = rawNotification.sms_email.replace(/(\@.+)$/, '')
										}
										if ( notification.sent ){
											notification.lastSent = new Date(rawNotification.last_sent)
										}
										notification.save(function(err){
											if ( err ) { console.log(err) }
											pauser.emit('-')
										})
									})// Section
								})// Term
							})// User
						})// each Notification
					})// Connection
				})// each School
			})// Schools
		}


		function downloadNotificationFeedback(){
			pauser.doneTxt = 'added-feedback'
			pauser.next = downloadCredits
			School.find({enabled: true, oldId: {$gte:1}}, function(err, schools){
				if ( err ){ console.log(err) }
				if ( !schools.length ){ console.error('School not enabled/found'); pauser.emit('-') }
				schools.forEach(function(school){
					sobj = school.toObject()
					schoolId = sobj.oldId
					db = school.abbr=='gatech'?'gt':school.abbr;
					query = 'SELECT `cn`.section_number,`cn`.term_id, `fb`.* FROM `courseshark`.`caffeine_successes` as `fb` INNER JOIN `courseshark`.`caffeine_notifications` as `cn` ON `cn`.id = `fb`.caffeine_notification_id WHERE `cn`.school_id='+schoolId+';'
					connection.query(query, function(err, rawFeedbacks, fields) {
						if ( err || !rawFeedbacks ){ console.log ( err, query ); pauser.emit('-'); return;}
						socket.emit('found-feedback', rawFeedbacks.length)
						pauser.count = rawFeedbacks.length
						rawFeedbacks.forEach(function(rawFeedback){
							rawFeedback.user_id = parseInt(rawFeedback.user_id, 10)
							User.findOne({oldId:rawFeedback.user_id}, {_id:1}, function(err, user){
								if ( err ){ console.log(err) }
								if ( !user ){ console.log('user not found', {oldId: rawFeedback.user_id}); pauser.emit('-'); return;}
								Term.findOne({school:school._id, number:parseInt(rawFeedback.term_id,10)}, function(err, term){
									if ( err ){ console.log(err) }
									if ( !term ){ pauser.emit('-'); return; }
									Section.findOne({term:term._id, number:rawFeedback.section_number}, {_id:1}, function(err, section){
										if ( err ){ console.log(err) }
										if ( !section ){ console.log('section not found ', rawFeedback); pauser.emit('-'); return;}

										Notification.findOne({section: section._id, user: user._id}, {_id:1}, function(err, notification){
											if ( err ){ console.log(err) }
											if ( !notification ){ console.log('notification not found'); pauser.emit('-'); return; }
											notificationFeedback = new NotificationFeedback({
													user: user._id
												, notification: notification._id
												,	ignore: (rawFeedback.ignore==1)
												,	success: (rawFeedback.success)
												, note: rawFeedback.story
												, createdAt: new Date(rawFeedback.created)
											})
											notificationFeedback.save(function(err){
												if ( err ) { console.log(err) }
												pauser.emit('-')
											})
										})// Notification
									})// Section
								})// Term
							})// User
						})// each Notification
					})// Connection
				})// each School
			})// Schools
		}


		function downloadCredits(){
			pauser.doneTxt = 'added-credits'
			pauser.next = downloadLinks
			query = 'SELECT * FROM `courseshark`.`credits` WHERE 1;'
			connection.query(query, function(err, rawCredits, fields) {
				if( err ) { console.log(err); pauser.emit('-'); return;}
				socket.emit('found-credits', rawCredits.length)
				pauser.count = rawCredits.length
				rawCredits.forEach(function(rawCredit){
					User.findOne({oldId: parseInt(rawCredit.user_id,10)}, {_id:1}, function(err, user){
						if ( err ) { console.log(err) }
						if ( !user ){ console.log('user not found!!! ', rawCredit); pauser.emit('-'); return;}
						credit = new Credit({
								user: user._id
							,	orderId: rawCredit.orderId
							, used: (rawCredit.used==1)
							, createdOn: new Date()
						})
						if ( credit.used ){
							credit.usedOn = new Date(rawCredit.used_on)
						}
						credit.save(function(err){
							if ( err ){ console.log(err) }
							pauser.emit('-')
						})
					})
					
				})// each Credit
			})// Connection
		}

		function downloadLinks(){
			var unserialize = require('../lib/utils').unserialize
			pauser.doneTxt = 'added-links'
			pauser.next = cleanupData
			query = 'SELECT * FROM `courseshark`.`schedule_links` WHERE `schedule` LIKE "s:%";'
			connection.query(query, function(err, rawLinks, fields) {
				if( err ) { console.log(err); pauser.emit('-'); return;}
				socket.emit('found-links', rawLinks.length)
				pauser.count = rawLinks.length
				rawLinks.forEach(function(rawLink){
					rawLink.schedule = rawLink.schedule.replace(/C:[0-9]+:[^:]+?/ig, 'a')
					var rawSchedule = unserialize(rawLink.schedule)
					if ( typeof rawSchedule === 'string'){
						var scheduleJSON = JSON.parse(rawSchedule)
						School.findOne({oldId: parseInt(scheduleJSON.school_id,10)}, function(err, school){
							if ( err ){ console.log(err) }
							if ( !school ){ console.log('no school', {oldId: scheduleJSON.school_id}); pauser.emit('-'); return; }
							Term.findOne({number: parseInt(scheduleJSON.term.number,10), school:school._id}, function(err, term){
								if ( err ){ console.log(err) }
								if ( !term ){ console.log('no term', {number: parseInt(scheduleJSON.term.number,10), school:school}); pauser.emit('-'); return; }
								var schedule = new Schedule({school: school._id, term: term._id, name: scheduleJSON.name })
								var secAdder = new EventEmitter()
								secAdder.count = scheduleJSON.sections.length
								secAdder.on('-', function(){
									if ( --secAdder.count <= 0 ){
										link = new ScheduleLink({schedule: schedule, hash: rawLink.hash})
										link.save(function(){
											if ( err ) { console.log(err) }
											pauser.emit('-');
										})
									}
								})
								if ( secAdder.count === 0 ){ secAdder.emit('-');}
								scheduleJSON.sections.forEach(function(rawSection){
									if ( isNaN(parseInt(rawSection.number,10)) ){ secAdder.emit('-'); return; }
									Section.findOne({term:term._id, number:parseInt(rawSection.number,10)}).populate('course').populate('department').exec(function(err, section){
										if ( err || !section ){ console.log(err||'no section found', rawSection);}
										schedule.sections.push(section)
										secAdder.emit('-')
									})
								})
							})
						})
					}else{ // Not string parsed from DB
						console.log('no-string');
						pauser.emit('-')
					}
				})// each Credit
			})// Connection
		}

		function cleanupData(){
			pauser.doneTxt = 'cleanup-data1'
			pauser.next = cleanupDataStep2
			User.find({oldFriends:{$exists:true}}, function(err, users){
				console.log('f',err,users);
				pauser.count = users.length
				users.forEach(function(user){
					userD = user.toObject()
					User.find({oldId:{$in:userD.oldFriends}}, function(err, friends){
						user.friends = friends.map(function(f){return f['_id']})
						console.log(user.friends);
						user.oldFriends = undefined
						user.save(function(err){
							console.log(err, err?user:'');
							pauser.emit('-')
						})
					})
				})
			})
		}

		function cleanupDataStep2(){
			pauser.doneTxt = 'cleanup-data'
			pauser.next = function(){ return; }
			User.update({oldId:{$exists: true}}, {$unset: {oldId:1, odlMajor:1, oldMajor:1}}, {multi:1}, function(err, num){
				console.log(err, num);
				pauser.emit('-')
			})
		}


		socket.on('start-import', function(uid){
			pauser.doneTxt = 'start-confirmed'
			User.findOne({_id:uid, admin:true}, function(err, user){
				pauser.next = function(user){return function(){clearDB(user)}}(user)
				if ( !err && user && user.admin ){
					socket.auth = user;
					pauser.emit('-')
				}
			})
		})
	})
}
