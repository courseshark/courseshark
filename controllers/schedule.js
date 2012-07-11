/*
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
exports = module.exports = function(app){
	var seats = app.io.of('/seats')
		,	crawler = require('../lib/crawler')
	/**
	*
	* Main Views
	*
	**/
	app.get('/schedule', requireSchool, function(req, res){
		Department.find({school:req.school._id}, {abbr:1, name:1}, {sort:{abbr:1}}, function(err, departments){
			res.render('schedule/schedule', {departments: departments, link: false, school: req.school._id, noJS: true});
		})
	})
	app.get('/schedule/link/:hash', function(req, res){
		res.redirect('/sl/'+req.params.hash);
	});
	app.get('/sl/:hash', function(req, res){
		ScheduleLink.findOne({hash: req.params.hash}, function(err, scheduleLink){
			if ( !scheduleLink ){
				throw new app.NotFound()
			}else{
				schedule = scheduleLink.schedule
				sJson = JSON.stringify(schedule)
				res.render('schedule/schedule', {link: true, school: schedule.school._id, schedule: sJson})
			}
		})
	})

	/**
	*
	* Schedule CRUD
	*
	**/
	app.get('/schedule/load/:sid', requireLogin, requireSchool, function(req, res){
		Schedule.findOne({_id: req.params.sid, user: req.user._id}).exec(function(err, schedule){
			res.json(schedule)
		})
	})
	app.get('/schedule/load', requireSchool, function(req, res){
		function returnNew(){
			var schedule
			schedule = new Schedule()
			schedule.school = req.school._id
			termId = req.school['currentTerm'] ? req.school.currentTerm._id : req.school.terms[req.school.terms.length-1]
			Term.findOne({_id: termId}, function(err, term){
				schedule.term = term
				res.json(schedule)
			})
		}
		if (req.loggedIn && req.user.schedule !== undefined ){
			Schedule.findById(req.user.schedule, function(err, foundSchedule){
				if ( err ){
					returnNew()
				}
				res.json(schedule);
			})
		}else{
			returnNew()
		}
	})
	app.get('/schedule/dialog/load', requireLogin, function(req, res){
		Schedule.find({user: req.user}).populate('term').exec(function(err, schedules){
			res.render('schedule/dialogs/load', {schedules: schedules})
		})
	})
	app.get('/schedule/save', requireLogin, function(req, res){
		res.render('schedule/dialogs/save', {user: req.user})
	})
	app.put('/schedule/save', requireLogin, requireSchool, function(req, res){
		passedJSON = JSON.parse(req.body.schedule)
		passedJSON.term = passedJSON.term.id
		passedJSON.school = req.school._id
		passedJSON.user = req.user._id
		Schedule.findOne({_id: passedJSON.id}, function(err, schedule){
			// Test if this is a new schedule
			if ( !schedule ){
				delete passedJSON.id;
				delete passedJSON._id;
				newSchedule = new Schedule(passedJSON)
				newSchedule.save(function(){
					res.json(newSchedule)
				})
			}else{
				// Update things
				schedule.name = passedJSON.name
				schedule.sections = passedJSON.sections
				schedule.save(function(){
					res.json(schedule)
				})
			}
		})
	})
	app.get('/schedule/delete/:sid', requireLogin, function(req, res){
		Schedule.findOne({_id: req.params.sid, user:req.user._id}, function(err, schedule){
			if ( schedule ){
				schedule.remove()
			}
			res.json(true)
		})
	})


	/**
	*
	* Dialogs
	*
	**/
	app.get('/schedule/dialog/new', requireSchool, function(req, res){
		Term.find({school:req.school._id}, {number:1,name:1,season:1,year:1}, {sort:{number:-1}}, function(err, terms){
			res.render('schedule/dialogs/new', {terms: terms })
		})
	});
	app.get('/schedule/dialog/numbers', function(req, res){
		res.render('schedule/dialogs/numbers')
	})
	app.get('/schedule/dialog/link', function(req, res){
		res.render('schedule/dialogs/link')
	})
	app.post('/schedule/link', function(req, res){
		function randomHash(){
			return (Math.floor(Math.random() * 10) + parseInt((new Date()).getTime()*10, 10)).toString(36)
		}
		pSchedule = JSON.parse(req.body.schedule);
		delete pSchedule._id;
		delete pSchedule.id;
		delete pSchedule.user;
		link = new ScheduleLink()
		link.schedule = pSchedule;
		if ( req.user ){
			link.user = req.user._id
		}
		// This bit doesnt seem to work right... it always makes a new link
		ScheduleLink.findOne(link, {hash:1}, function(err, existingLink){
			if ( err ){ console.log(err); }
			if ( !existingLink ){
				link.hash = randomHash()
				link.save(function(err){
					url = app.createLink('http://'+req.headers.host+'/sl/'+link.hash, req.user)
					res.json({id: link.id, url: url, err: err})
				})
			}else{
				url = app.createLink('http://'+req.headers.host+'/sl/'+existingLink.hash, req.user)
				res.json({id: existingLink._id, url: url, err:err})
			}
		})
	})



	/**
	*
	* Components
	*
	**/
	app.get('/schedule/terms', requireSchool, function(req, res){
		Term.find({school: req.school}, function(err, terms){
			res.json(terms)
		})
	})
		app.get('/school/departments', requireSchool, function(req, res){
		Department.find({school: req.school}, {}, {sort:{abbr:1}}, function(err, departments){
			res.json(departments)
		})
	})
	app.get('/school/departments/:sid', function(req, res){
		var id = req.params.sid || ''
		Department.find({school: id}, {}, {sort:{abbr:1}}, function(err, departments){
			res.json(departments)
		})
	})
	app.get('/term/:tid/courses/:did', function(req, res){
		termId = new ObjectId(req.params.tid)
		departmentId = new ObjectId(req.params.did)
		Course.find({terms: termId, department: departmentId }, {number:1, name:1, department:1}, {sort:{number:1}}).populate('department').exec(function(err, courses){
			res.json(courses)
		})
	})
	app.get('/term/:tid/sections/:cid', function(req, res){
		courseId = new ObjectId(req.params.cid)
		Section.find({course: courseId, term: req.params.tid}, {}, {sort:{number:1}}, function(err, sections){
			res.json(sections)
		})
	})
	app.get('/term/:tid/sections/:cid/full', function(req, res){
		courseId = new ObjectId(req.params.cid)
		Section.find({course: courseId, seatsAvailable: 0 }, function(err, sections){
			res.json(sections)
		})
	})


	seats.on('connection', function (socket) {
		socket.on('update', function(sectionId){
			var now = new Date()
				, FIFTEEN_MINUTES = 1000 * 60 * 15
			Section.findById(sectionId).exec(function(err, section){
				Term.findById(section.term).populate('school').exec(function(err, term){
					if ( term.active ){
						crawler[term.school.abbr].safeUpdateSection(section, FIFTEEN_MINUTES, function(err, section){
							seats.emit('result', {id: section.id, avail: section.seatsAvailable, total: section.seatsTotal, section: section})
						})
					}else{
							avail = section.seatsAvailable?section.seatsAvailable:'-'
							tot = section.seatsTotal?section.seatsTotal:'?'
							seats.emit('result', {id: section.id, avail: avail, total: tot, section: section})
					}
				})
			})
		})
	})

}
