exports = module.exports = function(app){
	// Home
	app.get('/search', requireSchool, function(req, res){
		req.query.q.school = req.school.id||req.school;
		if ( !req.query.q ){
			res.redirect('/s/');
		}else{

			query = req.query.q;
			if ( typeof query === 'string' ){
				query = {search: query};
			}
			query.re = new RegExp(query.search, 'i');
			query.school = req.school._id;

			preformSearch(query, function(result){
				res.json(result);
			});
		}
	});


	preformSearch = function(query, next){
		findDepartments(query, function(departments){
			findCourses(query, function(courses){
				findSections(query, function(sections){
					next(sections);
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
		Course.find().or([{'name':query.re},{'number':query.re},{'department':{$in: query.department_ids}}]).populate('department').exec(function(err, courses) {
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
		Section.find().or([{'name':query.re},{'instructor':query.re},{'course':{$in: query.course_ids}}]).exec(function(err, sections) {
			if (err){console.log(err);}
			if ( sections ){
				query.section_ids = sections.map(function(s){return s._id;});
			}
			next(sections);
		});
	};

};
