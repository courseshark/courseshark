var natural = require('natural')
			,	_ = require('underscore')
			,	searcher = require('../lib/search')
			, ObjectId = require('mongoose').Types.ObjectId
			,	EventEmitter = require("events").EventEmitter
			, redisInfo = require('url').parse(process.env.COURSESHARK_REDIS_URI)
			, redis = require('redis')
			, redisConnection = redis.createClient(redisInfo.port, redisInfo.hostname)
			, cacheExpire = process.env.COURSESHARK_SEARCH_CACHE_EXPIRE || 600


// hrtime polyfill
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

// redis connection info
redisConnection.on("error", function (err) {
	console.log("REDIS ERROR: " + err);
});



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
			,	emitter = new EventEmitter()
			, searchResults = {departments: [], courses: [], sections: []}
			, term = ObjectId(req.query.t) || req.school.currentTerm?req.school.currentTerm._id:null
			,	query = {query:{school:school}, string: req.query.q, term: term}
			, redisKey = 'search:'+school+':'+term+':'+req.query.q.replace(/s/g, '-')


		// Done Function
		function done(){
			totalTime = _process.hrtime(startTime);
			searchResults['time'] = totalTime[0]+(totalTime[1]/1e9)
			res.json(searchResults);
		}

		// If no query return
		if ( !req.query.q ){
			return done();
		}

		redisConnection.get(redisKey, function(err, result) {
			if (result){
				searchResults = JSON.parse(result)
				searchResults['fromCache'] = true
				done()
			}else{ // No cache found so do the search

				emitter.toDo = 0;

				// Find departments
				emitter.toDo++;
				searcher.searchCollection(Department, query, {returnObjects: true}, function(err, results){
					searchResults.departments = results;
					emitter.emit('-');
				});

				// Find Courses
				emitter.toDo++;
				termQuery = _.clone(query);
				termQuery.query = _.clone(query.query);
				if ( req.query.t ) { termQuery.query.terms = ObjectId(req.query.t) }
				searcher.searchCollection(Course, termQuery, {returnObjects: true, pullSections:true}, function(err, results){
					searchResults.courses = results;
					emitter.emit('-');
				})

				// Find Sections
				emitter.toDo++;
				sectionQuery = _.clone(query);
				sectionQuery.query = _.clone(query.query);
				if ( req.query.t ) { sectionQuery.query.term = ObjectId(req.query.t) }
				searcher.searchCollection(Section, sectionQuery, {returnObjects: true}, function(err, results){
					searchResults.sections = results;
					emitter.emit('-');
				})


				// When done, send over the results
				emitter.on('-', function(){
					if ( --emitter.toDo === 0){
						redisConnection.set(redisKey, JSON.stringify(searchResults))
						redisConnection.expire(redisKey, cacheExpire);
						searchResults['fromCache'] = false
						done()
					}
				});
			}
		})// End Redis Cache Test

	})

};
