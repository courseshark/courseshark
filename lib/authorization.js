var   user = require('./user')

exports.requireLogin = function (req, res, next) {
  if (!req.loggedIn) {
    if ( !req.headers['x-requested-with'] || req.headers['x-requested-with'] != "XMLHttpRequest" ){
      req.session.redirectTo=req.headers.referer||'/';
      res.redirect('/login');
    }else{
      req.session.redirectTo=req.headers.referer||'/';
      res.send(401);
      return;
    }
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
      req.session.destroy();
      res.json(1);
    })
    .findUserById(function(userId, callback){
      User.findById(userId, function(err, user){
        callback(err, user);
      });
    });

  everyauth.twitter
    .consumerKey(app.config.COURSESHARK_TWITTER_CONSUMER_KEY)
    .consumerSecret(app.config.COURSESHARK_TWITTER_CONSUMER_SECRET)
    .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData){
      var promise = this.Promise();
      user.findOrCreateTwitterData(twitterUserData, promise, session, app.mixpanel);
      return promise;
    })
    .sendResponse( function (res, data) {
      var session = data.session;
      var redirectTo = session.redirectTo||'/';
      delete session.redirectTo;
      res.redirect(redirectTo);
    })
    .redirectPath('/');

  everyauth.google
    .appId(app.config.COURSESHARK_GOOGLE_CLIENT_ID)
    .appSecret(app.config.COURSESHARK_GOOGLE_CLIENT_SECRET)
    .authQueryParam({ access_type:'online', approval_prompt:'auto' })
    .alwaysDetectHostname(true)
    .scope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')
    .findOrCreateUser(function (session, accessToken, extra, googleUser){
      var promise = this.Promise();
      user.findOrCreateGoogleData(googleUser, promise, session, app.mixpanel);
      return promise;
    })
    .sendResponse( function (res, data) {
      var session = data.session;
      var redirectTo = session.redirectTo||'/';
      delete session.redirectTo;
      res.redirect(redirectTo);
    })
    .redirectPath('/');

  everyauth.facebook
    .appId(app.config.COURSESHARK_FB_APP_ID)
    .appSecret(app.config.COURSESHARK_FB_APP_SECRET)
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
    .sendResponse( function (res, data) {
      var session = data.session;
      var redirectTo = session.redirectTo||'/';
      delete session.redirectTo;
      res.redirect(redirectTo);
    })
    .redirectPath('/');

  everyauth.linkedin
    .consumerKey(app.config.COURSESHARK_LINKEDIN_CONSUMER_KEY)
    .consumerSecret(app.config.COURSESHARK_LINKEDIN_CONSUMER_SECRET)
    .requestTokenPath('/uas/oauth/requestToken?scope=r_basicprofile+r_emailaddress')
    .fetchOAuthUser( function (accessToken, accessTokenSecret, params) {
      var promise = this.Promise();
      this.oauth.get(this.apiHost() + '/people/~:(id,first-name,last-name,headline,email-address,location:(name,country:(code)),industry,num-connections,num-connections-capped,summary,specialties,proposal-comments,associations,honors,interests,positions,publications,patents,languages,skills,certifications,educations,three-current-positions,three-past-positions,num-recommenders,recommendations-received,phone-numbers,im-accounts,twitter-accounts,date-of-birth,main-address,member-url-resources,picture-url,site-standard-profile-request:(url),api-standard-profile-request:(url,headers),public-profile-url)', accessToken, accessTokenSecret, function (err, data, res) {
        if (err) {
          err.extra = {data: data, res: res}
          return promise.fail(err);
        }
        var oauthUser = JSON.parse(data);
        promise.fulfill(oauthUser);
      });
      return promise;
    })
    .findOrCreateUser( function (session, accessToken, accessTokenSecret, linkedinUserMetadata) {
      var promise = this.Promise();
      user.findOrCreateLinkedInData(linkedinUserMetadata, promise, session, app.mixpanel);
      return promise;
    })
    .sendResponse( function (res, data) {
      var session = data.session;
      var redirectTo = session.redirectTo||'/';
      delete session.redirectTo;
      res.redirect(redirectTo);
    })
    .redirectPath('/');
}