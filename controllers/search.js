var natural = require('natural')
			,	_ = require('underscore')
			,	searcher = require('../lib/search')
			, ObjectId = require('mongoose').Types.ObjectId


exports = module.exports = function(app){

	app.get('/build-search', function(req, res){
		res.send(200);
		Department.find({}, function(err, allDepartments){
			_.each(allDepartments, function(department){
				department._tokens = natural.PorterStemmer.tokenizeAndStem(department.abbr + " " + department.name)
				department.save();
			})
		})
		Course.find({}).populate('department').exec(function(err, allCourses){
			_.each(allCourses, function(course){
				course._tokens = natural.PorterStemmer.tokenizeAndStem([course.department.abbr,course.number,course.name].join(' '))
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
			, searchResults = {departments: [], courses: [], sections: []};

		if ( !req.query.q ){
			res.json(searchResults);
			return;
		}
		query.term = ObjectId(req.query.t) || req.school.currentTerm?req.school.currentTerm._id:null

		emitter.toDo = 0;


		// Find departments
		emitter.toDo++;
		searcher.searchCollection(Department, query, {returnObjects: true}, function(err, results){
			searchResults.departments = results;
			emitter.emit('-');
		});

		// Find Courses
		emitter.toDo++;
		termQuery = query;
		if ( req.query.t ) { termQuery.query.terms = ObjectId(req.query.t) }
		searcher.searchCollection(Course, termQuery, {returnObjects: true, pullSections:true}, function(err, results){
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
