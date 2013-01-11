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

	app.get('/search', wantSchool, function(req, res){
		var _process = process
			,	startTime = _process.hrtime()
			,	school = typeof (_a=((req.school&&(req.school._id||req.school))||null))==='string'?ObjectId(_a):_a
			,	emitter = new EventEmitter()
			, searchResults = {departments: [], courses: [], sections: []}
			, term = new ObjectId(req.query.t)
			,	query = {query:{school:school}, string: req.query.q, term: term}
			, redisKey = 'search:'+school+':'+term+':'+req.query.q.replace(/s/g, '-')


		// Make sure school is ObjectId type
		if( !school ){
			searchResults['error'] = "No School"
			return done();
		}

		// Fallback to school's current term, but should be sent in request
		if ( !term ){
			term = req.school.currentTerm
		}


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

		redisConnection.get(redisKey, (function(query, term, emitter, school){return function(err, result) {
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
		}})(query, term, emitter, school))// End Redis Cache Test

	})

};
