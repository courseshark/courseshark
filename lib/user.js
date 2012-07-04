

exports.findOrCreateTwitterData = function(twitterData, promise){
	User.findOne({firstName: twitterData.screen_name}, function(err, user){
		if ( err ){
			console.log(err);
			promise.fail(err);
			return;
		}
		if ( user ){
			user.oauth = "twitter"
			user.save(function(err){
				promise.fulfill(user);
			});
		}else{
			user = new User();
			user.firstName = twitterData.screen_name;
			user.oauth = 'twitter';
			user.save(function(err){
				if ( err ){
					console.log("Error saving new user", err);
					promise.fail(err);
				}else{
					console.log("User saved");
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}

exports.findOrCreateGoogleData = function(googleData, promise){
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
			user.save(function(err){
				if ( err ){
					console.log("Error saving new user", err);
					promise.fail(err);
				}else{
					console.log("User saved");
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}


exports.findOrCreateFacebookData = function(fbUserData, promise){
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
			user.oauth = 'google';
			user.save(function(err){
				if ( err ){
					console.log("Error saving new user", err);
					promise.fail(err);
				}else{
					console.log("User saved");
					promise.fulfill(user);
				}
				return;
			});
		}
	});
}