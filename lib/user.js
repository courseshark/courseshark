var social = require('./social-track')

exports.findOrCreateTwitterData = function(twitterData, promise, session, mixpanel){
  User.findOne({'oauthInfo.twitter.id': twitterData.id}, function(err, user){
    if ( err ){
      console.log(err);
      promise.fail(err);
      return;
    }
    if ( user ){
      user.oauth = "twitter"
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['twitter'] = twitterData;
      user.lastLogin = new Date();
      user.loginCount++;
      user.save(function(err){
        promise.fulfill(user)
      });
      mixpanel.track('Logged In', {method: 'twitter', distinct_id: session.distinctId});
    }else{
      user = new User();
      user.firstName = twitterData.screen_name
      user.oauth = 'twitter'
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['twitter'] = twitterData
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

exports.findOrCreateLinkedInData = function(linkedInData, promise, session, mixpanel){
	User.findOne({$or: [{'oauthInfo.linkedin.id': linkedInData.id}, {email: linkedInData.emailAddress}] }, function(err, user){
		if ( err ){
			console.log(err);
			promise.fail(err);
			return;
		}
		if ( user ){
			user.oauth = "linkedin";
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['linkedin'] = linkedInData;
			user.lastLogin = new Date();
			user.loginCount++;
			user.save(function(err){
				promise.fulfill(user);
			});
			mixpanel.track('Logged In', {method: 'linkedin', distinct_id: session.distinctId});
		}else{
			user = new User();
			user.firstName = linkedInData.firstName
			user.email = linkedInData.lastName
			user.oauth = 'linkedin';
			user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['linkedin'] = linkedInData;
      user.referedFrom = session.initialReferer

			// Track a referal conversion
			social.trackReferal(session)
			mixpanel.track('Logged In', {method: 'linkedin', distinct_id: session.distinctId});
			mixpanel.track('Signup', {method: 'linkedin', distinct_id: session.distinctId});

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
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['google'] = googleData;
      user.lastLogin = new Date();
      user.loginCount++;
      user.save(function(err){
        promise.fulfill(user);
      });
      mixpanel.track('Logged In', {method: 'google', distinct_id: session.distinctId});
    }else{
      user = new User();
      user.firstName = googleData.email.replace(/@.+/gi,'')
      user.email = googleData.email;
      user.oauth = 'google';
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['google'] = googleData
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
  User.findOne({$or: [{'oauthInfo.facebook.id': fbUserData.id}, {email: fbUserData.email}]}, function(err, user){
    if ( err ){
      console.log(err);
      promise.fail(err);
      return;
    }
    if ( user ){
      user.oauth = "facebook";
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['facebook'] = fbUserData;
      user.lastLogin = new Date();
      user.loginCount++;
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
      user.oauthInfo = user.oauthInfo||{};
      user.oauthInfo['facebook'] = fbUserData;
      user.referedFrom = session.initialReferer;

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