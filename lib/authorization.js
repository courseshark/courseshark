var		user = require('./user')

exports.requireLogin = function (req, res, next) {
	if (!req.loggedIn) {
		res.redirect('/login');
	}
	next();
};

exports.requireAdmin = function (req, res, next) {
	if (!req.loggedIn) {
		res.redirect('/login');
	}
	if ( !req.user.admin ){
		req.flash('error', 'And just where do you think you are going?');
		res.redirect('/');
	}
	next();
};




exports.everyauthBoot = function(everyauth, app){

	everyauth.everymodule
		.handleLogout( function (req, res) {
			app.mixpanel.track('Logged Out', {distinct_id: req.session.distinctId});
			req.logout();
			this.redirect(res, this.logoutRedirectPath());
		});

	everyauth.twitter
			.consumerKey(app.config.twitter.consumerKey)
			.consumerSecret(app.config.twitter.consumerSecret)
			.findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData){
				var promise = this.Promise();
				user.findOrCreateTwitterData(twitterUserData, promise, session, app.mixpanel);
				return promise;
			})
			.redirectPath('/');
	
	everyauth.google
			.appId(app.config.google.clientId)
			.appSecret(app.config.google.clientSecret)
			.alwaysDetectHostname(true)
			.scope('https://www.googleapis.com/auth/userinfo.email')
			.findOrCreateUser(function (session, accessToken, extra, googleUser){
				var promise = this.Promise();
				user.findOrCreateGoogleData(googleUser, promise, session, app.mixpanel);
				return promise;
			})
			.redirectPath('/');
	
	everyauth.facebook
		.appId(app.config.facebook.appId)
		.appSecret(app.config.facebook.appSecret)
		.scope('email')
		.alwaysDetectHostname(true)
		.handleAuthCallbackError( function (req, res) {
			res.redirect('/login');
		})
		.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserData) {
			var promise = this.Promise();
			user.findOrCreateFacebookData(fbUserData, promise, session, app.mixpanel);
			return promise;
		})
		.redirectPath('/');
							
	everyauth.everymodule.findUserById(function(userId, callback){
			User.findById(userId, function(err, user){
				callback(err, user);
			});
		});
}