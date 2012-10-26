var natural = require('natural')
			,	_ = require('underscore')
			,	searcher = require('../lib/search')

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
		searcher.searchCollection(Course, query, {returnObjects: true, populate:[]}, function(err, results){
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

	preformSearch = function(query, next){
		findDepartments(query, function(departments){
			findCourses(query, function(courses){
				findSections(query, function(sections){
					next({departments: departments, courses: courses, sections: sections});
				});
			});
		});
	};

	findDepartments = function(query, next){
		Department.find({school:query.school}).or([{'abbr':query.re},{'name':query.re}]).select({abbr:1, name:1}).exec(function(err, departments) {
			query.department_ids = departments.map(function(d){return d._id;});
			next(departments);
		});
	};

	findCourses = function(query, next){
		Course.find().or([{'name':query.re},{'number':query.re}/*,{'department':{$in: query.department_ids}}*/]).populate('department').exec(function(err, courses) {
			foundCourses = [];
			for( var i=0,_len=courses.length;i<_len;i++){
				if ( courses[i].department.school.toString() == query.school.toString() ){
					foundCourses.push(courses[i]);
				}
			}
			query.course_ids = foundCourses.map(function(c){return c._id;});
			next(foundCourses);
		});
	};

	findSections = function(query, next){
		console.log(query);
		Section.find().or([{'name':query.re},{'instructor':query.re}/*,{'course':{$in: query.course_ids}}*/]).exec(function(err, sections) {
			if (err){console.log(err);}
			if ( sections ){
				query.section_ids = sections.map(function(s){return s._id;});
			}
			next(sections);
		});
	};

};
