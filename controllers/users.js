/*
 * User management site pages
 */
var MandrillAPI = require('mailchimp').MandrillAPI
	,	social = require('../lib/social-track')

exports = module.exports = function(app){

	try {
		var mandrill = new MandrillAPI(app.config.email.mandrillKey, { version : '1.0', secure: false });
	} catch (error) {
		console.log('Mandrill Error: ' + error);
	}


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
					app.mixpanel.track('Logged In', {method: 'password', distinct_id: req.session.distinctId});
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

			user.referedFrom = req.session.initialReferer
			// Track a referal conversion
			social.trackReferal(req.session)

			app.mixpanel.track('Signup', {distinct_id: req.session.distinctId})

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
	

	// Forgot password
	app.get('/forgot-password', function(req, res){
		res.render('dialogs/forgot')
	})

	app.post('/forgot-password', function(req, res){
		if ( req.body.user.email === '' ){
			res.json(false); return;
		}
		User.findOne({email: req.body.user.email}, function(err, userFound){
			if ( err ){ console.log(err); res.json(false); return; }
			if ( !userFound ){ res.json(false); return; }
			newPassword = (Math.floor(Math.random() * 10) + parseInt((new Date()).getTime()*10, 10)).toString(36);
			userFound.setPassword(newPassword)
			userFound.save(function(err){
				if (err){ res.json(false); return; }
				mandrill.messages_send_template({
						template_name:'password_reset'
					, template_content:''
					,	message:{
							subject: 'CourseShark Password'
						,	from_email: 'shark-cage@courseshark.com'
						,	from_name: 'CourseShark Password'
						,	track_opens: true
						, track_clicks: true
						,	auto_txt: true
						,	to: [{name: userFound.name, email: userFound.email}]
						,	template_content: [{name: 'DATAPASS', content: newPassword}]
						,	global_merge_vars:[
								{name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
							,	{name: 'SUBJECT', content: 'CourseShark Password'}
							]
						, merge_vars:[{
								rcpt: userFound.email
							,	vars:[
									{name: 'FNAME', content: userFound.firstName}
								,	{name: 'DATAPASS', content: newPassword}]
							}]
						, tags: ['user', 'password']
						}
					}, function (data){
						res.json(true)
				})
			})
		})
	})


	// Choose School page
	app.get('/choose-school', function(req, res){
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


	app.get('/settings', requireLogin, function(req, res){
		User.findById(req.user._id).populate('major').populate('school').exec(function(err, user){
			req.user.getFriends(function(err, friends){
				School.find({enabled: true}, {}, {sort:{abbr:1}}).exec(function(err, schools){
					schools = schools || []
					res.render('user/settings', {account: user, schools: schools, friends:friends, noJS: true})
				})
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
			return
		})
	})

}
