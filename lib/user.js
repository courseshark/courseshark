var social = require('./social-track')

exports.findOrCreateTwitterData = function(twitterData, promise, session, mixpanel){
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
			mixpanel.track('Logged In', {method: 'twitter', distinct_id: session.distinctId});
		}else{
			user = new User();
			user.firstName = twitterData.screen_name
			user.oauth = 'twitter'
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)
			mixpanel.track('Logged In', {method: 'twitter', distinct_id: session.distinctId});
			mixpanel.track('Signup', {method: 'twitter', distinct_id: session.distinctId});

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

exports.findOrCreateGoogleData = function(googleData, promise, session, mixpanel){
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
			mixpanel.track('Logged In', {method: 'google', distinct_id: session.distinctId});
		}else{
			user = new User();
			user.firstName = googleData.email.replace(/@.+/gi,'')
			user.email = googleData.email;
			user.oauth = 'google';
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)
			mixpanel.track('Logged In', {method: 'google', distinct_id: session.distinctId});
			mixpanel.track('Signup', {method: 'google', distinct_id: session.distinctId});

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


exports.findOrCreateFacebookData = function(fbUserData, promise, session, mixpanel){
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
			mixpanel.track('Logged In', {method: 'facebook', distinct_id: session.distinctId});
		}else{
			user = new User();
			user.firstName = fbUserData.first_name;
			user.lastName = fbUserData.last_name;
			user.email = fbUserData.email;
			user.oauth = 'facebook';
			user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)
			mixpanel.track('Logged In', {method: 'facebook', distinct_id: session.distinctId});
			mixpanel.track('Signup', {method: 'facebook', distinct_id: session.distinctId});

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