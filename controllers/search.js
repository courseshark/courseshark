var natural = require('natural')
			,	_ = require('underscore')
			,	searcher = require('../lib/search')
			, ObjectId = require('mongoose').Types.ObjectId


exports = module.exports = function(app){

	app.get('/build-search', function(req, res){
		res.send(200);
		Department.find({}, function(err, allDepartments){
			_.each(allDepartments, function(department){
				department._tokens = natural.LancasterStemmer.tokenizeAndStem(department.abbr + " " + department.name)
				department.save();
			})
		})
		Course.find({}).populate('department').exec(function(err, allCourses){
			_.each(allCourses, function(course){
				course._tokens = natural.LancasterStemmer.tokenizeAndStem([course.department.abbr,course.number,course.name].join(' '))
				course.departmentAbbr = course.department.abbr;
				Term.find({_id: {$in: course.terms}}).exec(function(err, terms){
					for(var i=0;i<terms.length;i++){
						course.school = terms[i].school;
					}
					course.save();
				})
			})
		})
	})


	app.get('/search', requireSchool, function(req, res){
		var school = req.school._id||req.school
			,	query = {query:{school:school}, string: req.query.q}
			,	EventEmitter = require("events").EventEmitter
			,	emitter = new EventEmitter()

		emitter.toDo = 0;

		searchResults = {departments: null, courses: null, sections: null};

		// Find departments
		emitter.toDo++;
		searcher.searchCollection(Department, query, {returnObjects: true}, function(err, results){
			searchResults.departments = results;
			emitter.emit('-');
		});

		// Find Courses
		emitter.toDo++;
		termQuery = query;
		if ( req.query.t ) { termQuery.query.terms = ObjectId("4ffd25a2668b5416035b5850") }
			console.log(termQuery.query)
		searcher.searchCollection(Course, termQuery, {returnObjects: true, populate:[]}, function(err, results){
			searchResults.courses = results;
			emitter.emit('-');
		})

		// Find Sections
		emitter.toDo++;
		searcher.searchCollection(Section, query, {returnObjects: true}, function(err, results){
			searchResults.sections = results;
			emitter.emit('-');
		})

		// When done, send over the results
		emitter.on('-', function(){
			if ( --emitter.toDo === 0){
				res.json(searchResults);
			}
		});

	})

};
