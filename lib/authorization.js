var		user = require('./user')

exports.requireLogin = function (req, res, next) {
	if (!req.loggedIn) {
		req.flash('notice', 'You are not logged in. Please login')
		res.redirect('/login')
	}
	next()
};

exports.requireOrganizer = function (req, res, next) {
	if( !req.user.organizer ){
		req.flash('notice', 'You are not logged in. Please login')
		res.redirect('/organizer/signup')
	}
	next()
};



exports.everyauthBoot = function(everyauth, app){

	everyauth.twitter
			.consumerKey('K6whFxok2yY5CIYlCMt21Q')
			.consumerSecret('VVxJFuYOznOd4fPIiIiuZ5Grd2ITCjk5yvLXZyyV6s')
			.findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData){ 
				var promise = this.Promise();
				user.findOrCreateTwitterData(twitterUserData, promise);
				return promise;
			})
			.redirectPath('/');
	
	everyauth.google
			.appId(app.config.google.clientId)
			.appSecret(app.config.google.clientSecret)
			.scope('https://www.googleapis.com/auth/userinfo.email')
			.findOrCreateUser(function (sess, accessToken, extra, googleUser){
				var promise = this.Promise();
				user.findOrCreateGoogleData(googleUser, promise);
				return promise;
			})
			.redirectPath('/');
	
	everyauth.facebook
		.appId('390689880955359')
		.appSecret('c4b713c95a05d7b36e6514cab8bead34')
		.scope('email')
		.handleAuthCallbackError( function (req, res) {
			res.redirect('/login');
		})
		.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserData) {
			var promise = this.Promise();
			user.findOrCreateFacebookData(fbUserData, promise);
			return promise;
		})
		.redirectPath('/');
							
	everyauth.everymodule.findUserById(function(userId, callback){
			User.findById(userId, function(err, user){
				callback(err, user);
			}); 
		});
}