/*
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
exports = module.exports = function(app){
	// Main Scheudle Page
	app.get('/schedule', requireSchool, function(req, res){
		console.log(req.school)
		Department.find({school:req.school._id}, {abbr:1, name:1}, function(err, departments){
			res.render('schedule/schedule', {departments: departments, link: false});
		})
	})
	app.get('/schedule/dialog/new', requireSchool, function(req, res){
		Term.find({school:req.school._id}, function(err, terms){
			console.log(terms, err)
			res.render('schedule/dialogs/new', {terms: terms })
		})
	});
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
	app.get('/schedule/dialog/numbers', function(req, res){
		res.render('schedule/dialogs/numbers')
	})

}
