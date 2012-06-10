/*
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
exports = module.exports = function(app){
	var seats = app.io.of('/seats')
		,	crawler = require('../crawler')
	/**
	*
	* Main Views
	*
	**/
	app.get('/schedule', requireSchool, function(req, res){
		Department.find({school:req.school._id}, {abbr:1, name:1}, function(err, departments){
			res.render('schedule/schedule', {departments: departments, link: false, school: req.school._id});
		})
	})
	app.get('/sl/:id', function(req, res){
		ScheduleLink.findById(req.params.id, function(err, scheduleLink){
			if ( !scheduleLink ){
				throw new NotFound()
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
		Schedule.findOne({_id: req.params.sid, user: req.user._id}).run(function(err, schedule){
			res.json(schedule)
		})
	})
	app.get('/schedule/load', requireSchool, function(req, res){
		function returnNew(){
			var schedule
			schedule = new Schedule()
			schedule.school = req.school._id
			Term.findOne({_id: req.school.currentTerm._id}, function(err, term){
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
		Schedule.find({user: req.user}).populate('term').run(function(err, schedules){
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
		Term.find({school:req.school._id}, function(err, terms){
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
		pSchedule = JSON.parse(req.body.schedule);
		delete pSchedule._id;
		delete pSchedule.id;
		delete pSchedule.user;
		link = new ScheduleLink()
		link.schedule = pSchedule;
		link.save(function(err){
			url = 'http//' + req.headers.host + '/sl/' + link.id
			res.json({id: link.id, url: url, err: err})
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
	app.get('/term/:tid/departments', requireSchool, function(req, res){
		Department.find({school: req. school}, function(err, departments){
			res.json(departments)
		})
	})
	app.get('/term/:tid/courses/:did', function(req, res){
		termId = new ObjectId(req.params.tid)
		departmentId = new ObjectId(req.params.did)
		Course.find({term: termId, department: departmentId }, {number:1, name:1, department:1}).populate('department').run(function(err, courses){
			res.json(courses)
		})
	})
	app.get('/sections/:cid', function(req, res){
		courseId = new ObjectId(req.params.cid)
		Section.find({course: courseId }, function(err, sections){
			res.json(sections)
		})
	})
	app.get('/sections/:cid/full', function(req, res){
		courseId = new ObjectId(req.params.cid)
		Section.find({course: courseId, seatsAvailable: 0 }, function(err, sections){
			res.json(sections)
		})
	})


	seats.on('connection', function (socket) {
		socket.on('update', function(sectionId){
			var now = new Date()
				, FIFTEEN_MINUTES = 1000 * 60 * 15
			Section.findById(sectionId).populate('course').run(function(err, section){
				Term.findById(section.course.term).populate('school').run(function(err, term){
					sectionUpdated = new Date(section.updated)
					if ( sectionUpdated.getTime() + FIFTEEN_MINUTES < now.getTime() && typeof(section.seatsAvailable) !== undefined ){
						crawler[term.school.abbr].updateSection(section, term, function(err, section){
							seats.emit('result', {id: section.id, avail: section.seatsAvailable, total: section.seatsTotal, section: section})
						})
					}else{
						seats.emit('result', {id: section.id, avail: section.seatsAvailable, total: section.seatsTotal, section: section})
					}
				})
			})
		})
	});

}
