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
		User.findOne({ $or: [{ email: req.body.user.email }, { firstName: req.body.user.email }] }, function(err, user){
			if ( user && user.authenticate(req.body.user.password) ){
				auth = {}
				auth.userId = auth.userId || user.id
				auth.loggedIn = true
				req.session.auth = auth
				req.user = user
				req.session.save()
				if ( req.params.format === 'json' || req.headers['x-requested-with'] === 'XMLHttpRequest' ){
					res.json({ success: true, redirect: '/' });
				}else{
					res.redirect('/');
				}
			}else{
				if ( req.params.format === "json" || req.headers['x-requested-with'] === 'XMLHttpRequest' ){
					res.json({ success: false, redirect: '/login' });
				}else{
					req.flash('info', 'Umm... How about you try that again');
					res.redirect('/login');
				}
			}
		})
	})

	app.get('/signup', function(req, res){
		School.find( {enabled: true}, {}, {sort:{abbr:1}}, function(err, schools){
			res.render('dialogs/signup', {schools: schools});
		})
	});

	app.post('/signup', function(req, res){
		User.findOne({email: req.body.user.email}, function(err, existingUser){
			if ( existingUser ){
				res.json({success: false, message: 'email'})
				return;
			}
			var user = new User({email: req.body.user.email, school: req.body.user.school, firstName: req.body.user.email})
			user.setPassword(req.body.user.password)
			user.save(function(err){
				console.log(err);
				if ( err ){
					res.json({success: false, message: err})
				}else{
					auth = {}
					auth.userId = auth.userId || user.id
					auth.loggedIn = true
					req.session.auth = auth
					req.session.save()
					req.user = user
					res.json({success: true, message: '/'})
				}
			})
		})
	});
	
	// Choose School page
	app.get('/choose-school', function(req, res){
		console.log(req.header('Referer'))
		School.find({enabled: true}, {}, {sort:{abbr:1}}, function(err, schools){
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
			if ( req.user && req.user._id ){
				req.user.school = school
				req.user.save()
			}
			url = req.session.schoolNeeded===undefined?'/':req.session.schoolNeeded
			newDomain = 'http://'+school.abbr+'.'+req.app.config.domain+url
			res.redirect(newDomain)
		});
	})


	app.get('/settings', function(req, res){
		User.findById(req.user._id).populate('major').populate('school').exec(function(err, user){
			School.find({enabled: true}, {}, {sort:{abbr:1}}).exec(function(err, schools){
				schools = schools || []
				res.render('user/settings', {account: user, schools: schools})
			})
		})
	})

	app.put('/settings', requireLogin, function(req, res){
		res.json(true)
		updateData = req.body.user;
		updateData = {
					school: req.body.user.school
				, major: req.body.user.major
				,	year: req.body.user.year
				,	canEmailFriendRequests: req.body.user.canEmailFriendRequests=='true'
				,	autoAcceptFriends: req.body.user.autoAcceptFriends=='true'
				,	modified: new Date()
				}
		t = req.body.user.firstName && (updateData.firstName=req.body.user.firstName)
		t = req.body.user.lastName && (updateData.lastName=req.body.user.lastName)
		t = req.body.user.email && (updateData.email=req.body.user.email)
		
		if ( ( req.user.authenticate(req.body.user.currentPassword) || req.user.isPasswordless() ) && req.body.user.confirmPassword===req.body.user.password){
			req.user.setPassword(req.body.user.password).save()
		}
		User.update({_id: req.user.id}, updateData, function(err, num){
			console.info(err, num, updateData, req.user);
			return
		})
	})

}
