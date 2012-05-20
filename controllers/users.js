/* 
 * Static site pages, including the main page and about pages 
 */
exports = module.exports = function(app){
	// home
	app.get('/login', function(req, res){
		res.render('dialogs/login');
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
		School.find({enabled: true}, function(err, schools){
			res.render('signup/schools', {schools: schools});
		});
	})
	
}
