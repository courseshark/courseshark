var social = require('./social-track')

exports.findOrCreateTwitterData = function(twitterData, promise, session){
	User.findOne({firstName: twitterData.screen_name}, function(err, user){
		if ( err ){
			console.log(err);
			promise.fail(err);
			return;
		}
		if ( user ){
			user.oauth = "twitter"
			user.save(function(err){
				promise.fulfill(user)
			});
		}else{
			user = new User();
			user.firstName = twitterData.screen_name
			user.oauth = 'twitter'
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)

			user.save(function(err){
				if ( err ){
					promise.fail(err);
				}else{
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}

exports.findOrCreateGoogleData = function(googleData, promise, session){
	User.findOne({email: googleData.email}, function(err, user){
		if ( err ){
			console.log(err);
			promise.fail(err);
			return;
		}
		if ( user ){
			user.oauth = "google";
			user.save(function(err){
				promise.fulfill(user);
			});
		}else{
			user = new User();
			user.email = googleData.email;
			user.oauth = 'google';
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)

			user.save(function(err){
				if ( err ){
					promise.fail(err);
				}else{
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}


exports.findOrCreateFacebookData = function(fbUserData, promise, session){
	User.findOne({email: fbUserData.email}, function(err, user){
		if ( err ){
			console.log(err);
			promise.fail(err);
			return;
		}
		if ( user ){
			user.oauth = "facebook";
			user.save(function(err){
				promise.fulfill(user);
			});
		}else{
			user = new User();
			user.email = fbUserData.email;
			user.oauth = 'facebook';
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)

			user.save(function(err){
				if ( err ){
					promise.fail(err);
				}else{
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}