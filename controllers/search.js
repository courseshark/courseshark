var natural = require('natural')
			,	_ = require('underscore')
			,	searcher = require('../lib/search')
			, ObjectId = require('mongoose').Types.ObjectId
			,	EventEmitter = require("events").EventEmitter


process.hrtime = process.hrtime || function(d){
	var _now = Date.now()
		,	now = [Math.floor(_now/1000), Math.floor((_now/1000%1)*1e9)]
	if ( !d ){
		return _now
	}else{
		diff = _now-d;
		return [Math.floor(diff/1000), Math.floor((diff/1000%1)*1e9)]
	}
}

exports = module.exports = function(app){

	app.get('/build-search', function(req, res){
		var startTime = process.hrtime()
			,	emitter = new EventEmitter()
		emitter.total = 3
		emitter.on('decrement', function(d){
			if(d === 'department'){
				emitter.department_count--;
			}else if(d === 'course'){
				emitter.course_count--;
			}else if(d === 'section'){
				emitter.section_count--;
			}else{
				emitter.total--;
			}
			console.log('d', emitter.department_count, emitter.course_count, emitter.section_count);
			if (emitter.department_count+emitter.course_count+emitter.section_count === 0 || emitter.total === 0){
				var totalTime = process.hrtime(startTime)
					,	time = totalTime[0]+(totalTime[1]/1e9)
				res.json({done: true, time:time})
			}
		})

		Department.find({_tokens:{$exists: false}}, function(err, allDepartments){
			emitter.department_count = allDepartments.length;
			_.each(allDepartments, function(department){
				department._tokens = natural.PorterStemmer.tokenizeAndStem(department.abbr + " " + department.name)
				department.save(function(err){
					emitter.emit('decrement', 'department');
				});
			})
			emitter.emit('decrement', 'total');
		})

		Course.find({_tokens:{$exists: false}}).populate('department').exec(function(err, allCourses){
			emitter.course_count = allCourses.length;
			_.each(allCourses, function(course){
				course._tokens = natural.PorterStemmer.tokenizeAndStem([course.department.abbr,course.number,course.name,course.description].join(' ').trim())
				course.departmentAbbr = course.department.abbr;
				Term.find({_id: {$in: course.terms}}).exec(function(err, terms){
					for(var i=0;i<terms.length;i++){
						course.school = terms[i].school;
					}
					course.save(function(err){
						emitter.emit('decrement', 'course');
					});
				})
			})
			emitter.emit('decrement', 'total');
		})

		Section.find({_tokens:{$exists: false}}).exec(function(err, allSections){
			emitter.section_count = allSections.length;
			_.each(allSections, function(section){
				section._tokens = natural.PorterStemmer.tokenizeAndStem([section.instructor,section.description].join(' ').trim())
				section.save(function(err){
					emitter.emit('decrement', 'section');
				});
			})
			emitter.emit('decrement', 'total');
		})

		// Make sure sections have schools associated
		Term.find({}).exec(function(err, terms){
			console.log("found ", terms.length, "term")
			_.each(terms, function(term){
				Section.update({term: term}, {$set: {school: term.school}}, {multi: true}, function(err, num){
					console.log("Updated", num, "sections setting school to", term.school, "for term", term.name, err)
				})
			})
		})

	})


	app.get('/search', requireSchool, function(req, res){
		var _process = process
			,	startTime = _process.hrtime()
			,	school = req.school._id||req.school
			,	query = {query:{school:school}, string: req.query.q}
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
		searcher.searchCollection(Section, termQuery, {returnObjects: true}, function(err, results){
			searchResults.sections = results;
			emitter.emit('-');
		})

		// When done, send over the results
		emitter.on('-', function(){
			if ( --emitter.toDo === 0){
				totalTime = _process.hrtime(startTime);
				searchResults['time'] = totalTime[0]+(totalTime[1]/1e9)
				res.json(searchResults);
			}
		});

	})

};
