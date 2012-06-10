/*
 * Static site pages, including the main page and about pages
 */
exports = module.exports = function(app){
	// home
	app.get('/login', function(req, res){
		if ( req.headers['x-requested-with'] === 'XMLHttpRequest' ){
			res.render('dialogs/login');
		}else{
			res.render('user/login')
		}
	})
	
	app.post('/login.:format?', function(req, res){
		User.findOne({ $or: [{ email: req.user.email }, { firstName: req.user.email }] }, function(err, user){
			if ( user && user.authenticate(req.user.password) ){
				req.session.user = user;
				if ( req.params.format === 'json' ){
					res.json({ success: true });
				}else{
					// TODO redirect to where we were trying to go
					res.redirect('/');
				}
			}else{
				if ( req.params.format === "json" ){
					res.json({ success: false });
				}else{
					req.flash('info', 'Umm... How about you try that again');
					res.redirect('/login');
				}
			}
		})
	})

	app.get('/signup', function(req, res){
		School.find( {enabled: true}, function(err, schools){
			res.render('dialogs/signup', {schools: schools});
		})
	});

	app.post('/signup', function(req, res){
		// Create user from form
	});
	
	// Choose School page
	app.get('/choose-school', function(req, res){
		console.log(req.header('Referer'))
		School.find({enabled: true}, function(err, schools){
			res.render('signup/schools', {schools: schools});
		});
	})
	
		// Choose School page
	app.get('/schools/set/:abbr', function(req, res){
		School.findOne({enabled: true, abbr: req.params.abbr}, function(err, school){
			if ( err ){
				res.redirect('/choose-school')
				return;
			}
			console.log(school)
			url = req.session.schoolNeeded===undefined?'/':req.session.schoolNeeded
			newDomain = 'http://'+school.abbr+'.'+req.app.config.domain+url
			res.redirect(newDomain)
		});
	})


	app.get('/settings', function(req, res){
		res.render('user/settings', {user: req.user})
	})



}
