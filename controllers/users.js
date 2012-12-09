/*
 * User management site pages
 */
var MandrillAPI = require('mailchimp').MandrillAPI
  , social = require('../lib/social-track')
  , userLib = require('../lib/user')

exports = module.exports = function(app){

  try {
    var mandrill = new MandrillAPI(app.config.email.mandrillKey, { version : '1.0', secure: false });
  } catch (error) {
    console.log('Mandrill Error: ' + error);
  }


  app.post('/api/user/:id', requireLogin, function(req, res){
    if (req.user.id != req.params.id){
      res.json({error: 'Not Authorized'});
      return
    }
    if ( req.body.updateName ){
      var nameSettings = req.body.updateName;
      req.user.firstName = nameSettings.firstName;
      req.user.lastName = nameSettings.lastName;
      req.user.save(function(err){
        if (err){ res.json({success: false, error: err}); return; }
        res.json({success: true})
      })
    }
    if ( req.body.updateEmail ){
      req.user.email = req.body.updateEmail.email
      req.user.save(function(err){
        if (err){ res.json({success: false, error: err}); return; }
        res.json({success: true})
      })
    }
    if ( req.body.changePassword ){
      var newPasswordSettings = req.body.changePassword
      if ((req.user.isPasswordless()||req.user.authenticate(newPasswordSettings.current)) && newPasswordSettings.password){
        req.user.setPassword(newPasswordSettings.password).save(function(err){
          if ( err ){
            res.json({success: false, error: err})
          }else{
            res.json({success: true})
          }
        })
      }else{
        res.json({error: "Incorrect Current Password"})
      }
    }

  })

  app.get('/me', function(req, res){
    if ( !req.loggedIn ){
      res.json(false)
    }else{
      user = userLib.cleanUserObject(req.user.toObject());
      School.findById(user.school, function(err, school){
        user.school = school;
        if (req.user.hashPassword){
          user.password = true
        }
        user.oauthPassword = []
        for( var provider in req.user.oauthInfo ){
          if (req.user.oauthInfo.hasOwnProperty(provider)) {
            user.oauthPassword.push(provider);
          }
        }
        res.json({user: user, user_id: user.id, access_token: req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'')})
      })
    }
  })

  // home
  app.get('/login.:format?', function(req, res){
    if ( req.headers['x-requested-with'] === 'XMLHttpRequest' || req.params.format === "tmpl"){
      req.session.redirectTo=req.headers.referer||'/';
      res.render('dialogs/login', {noJs: true});
    }else{
      res.render('user/login')
    }
  })

  app.post('/login.:format?', function(req, res){
    User.findOne({ $or: [{ email: req.body.user.email }, { firstName: req.body.user.email }] }, function(err, user){
      if ( user && user.authenticate(req.body.user.password) ){
        auth = {};
        auth.userId = auth.userId || user.id;
        auth.loggedIn = true;
        req.session.auth = auth;
        req.user = user;
        delete req.session.redirectTo;
        req.session.save();

        if ( req.params.format === 'json' || req.headers['x-requested-with'] === 'XMLHttpRequest' ){
          res.json({
              success: true
            , redirect: '/'
            , access_token: req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'')
            , user_id: req.user.id
            , user: req.user });
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

      app.mixpanel.track('Signup', {method: 'password', distinct_id: req.session.distinctId})

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
          res.json({
              success: true
            , redirect: '/'
            , access_token: req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'')
            , user_id: req.user.id
            , user: req.user
            , message: '/'})
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
          , message:{
              subject: 'CourseShark Password'
            , from_email: 'shark-cage@courseshark.com'
            , from_name: 'CourseShark Password'
            , track_opens: true
            , track_clicks: true
            , auto_txt: true
            , to: [{name: userFound.name, email: userFound.email}]
            , template_content: [{name: 'DATAPASS', content: newPassword}]
            , global_merge_vars:[
                {name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
              , {name: 'SUBJECT', content: 'CourseShark Password'}
              ]
            , merge_vars:[{
                rcpt: userFound.email
              , vars:[
                  {name: 'FNAME', content: userFound.firstName}
                , {name: 'DATAPASS', content: newPassword}]
              }]
            , tags: ['user', 'password']
            }
          }, function (data){
            res.json(true)
        })
      })
    })
  })

  // Link or login from facebook accessToken
  app.get('/auth/facebook-from-token', function(req, res){
    var FB = require('FB');
    FB.options({accessToken: req.query.accessToken});
    FB.api('me', function(fbRes){
      if ( req.session.auth && req.user ){
        // We are logged in so lets link / add FB user info to account
        req.user.oauthInfo = req.user.oauthInfo||{};
        req.user.oauthInfo['facebook'] = fbRes;
        req.user.markModified('oauthInfo');
        req.user.save(function(err){if(err){console.log('ERROR:: /auth/facebook-from-token',err)}});
        req.session.auth.facebook = {accessToken: req.query.accessToken};
        User.findOne({_id: {$ne: req.user._id}, school: req.user.school, 'oauthInfo.facebook.id': fbRes.id}, function(err, duplicate){
          if (duplicate){
            res.json({duplicate: duplicate._id})
          }else{
            res.json(true);
          }
        })
        return;
      }else{
        var userFindOrCreate = require('../lib/user').findOrCreateFacebookData
          , userPromise = new (require('events').EventEmitter)();
        // Create a fake promise object from an EventEmitter
        userPromise.fulfill = function(user){ this.emit('fulfill', user) }
        userPromise.fail = function(err){ this.emit('fail', err) }
        // Call the findOrCreate function
        userFindOrCreate(fbRes, userPromise, req.session, app.mixpanel)
        // When we get our promise back fulfull the request
        userPromise.on('fulfill', function(user){
          req.session.auth = {
              facebook: {
                  accessToken: req.query.accessToken
                , user: fbRes
              }
            , loggedIn: true
            , userId: user.id
          };
          res.json({
              access_token: req.query.accessToken
            , user_id: user.id
            , user: user
          });
        })
        userPromise.on('fail', function(err){
          res.json({error: err});
        });
      }
    })
  });


  // Merge self into user
  app.get('/user/merge-prompt', requireLogin, function(req, res){
    if ( !req.query.duplicate ){
      res.send(400);
    }
    User.findById(req.query.duplicate, function(err, foundUser){
      if (err||!foundUser){
        res.send(404);
        return;
      }
      if ( !req.user.isDuplicate(foundUser) ){
        res.json({error:'Not duplicates'})
        return;
      }
      Schedule.find({user: req.user}, {name:1}, function(err, mySchedules){
        req.user.getFriends(function(err, myFriends){
          Schedule.find({user: foundUser}, {name:1}, function(err, foundSchedules){
            foundUser.getFriends(function(err, foundFriends){
              var me = {
                      avatar: req.user.avatar
                    , name: req.user.name
                    , email: req.user.email
                    , schedulesCount: mySchedules.length
                    , friendsCount: myFriends.length
                  }
                , found = {
                      avatar: foundUser.avatar
                    , name: foundUser.name || ''
                    , email: foundUser.email || ''
                    , schedulesCount: foundSchedules.length
                    , friendsCount: foundFriends.length
                  }
              res.json({me:me, found:found});
            })
          })
        })
      })
    })
  })



  app.get('/user/merge', function(req, res){
    res.send(405); // Method not Allowed
  })

  app.post('/user/merge', requireLogin, function(req, res){
    if ( !req.body.duplicate ){
      res.send(405);
    }
    User.findById(req.body.duplicate, function(err, foundUser){
      if (err||!foundUser){
        res.send(404);
        return;
      }
      if ( !req.user.isDuplicate(foundUser) ){
        res.json({error:'Not duplicates'})
        return;
      }
      var newId = req.user._id
        , oldId = foundUser._id
      // Begin Changeover
      Schedule.update({user: oldId}, {$set: {user: newId}}, {multi: true}, function(err, numChanged){
        Link.update({user: oldId}, {$set: {user: newId}}, {multi: true}, function(err, numChanged){
          Notification.update({user: oldId}, {$set: {user: newId}}, {multi: true}, function(err, numChanged){
            ScheduleLink.update({user: oldId}, {$set: {user: newId}}, {multi: true}, function(err, numChanged){
              var userUpdate = {
                      hashPassword: req.user.hashPassword ||  foundUser.hashPassword
                    , firstName: req.user.firstName || foundUser.firstName
                    , lastName: req.user.lastName || foundUser.lastName
                    , major: req.user.major || foundUser.major
                    , year: req.user.year || foundUser.year
                    , shareWithRecruiters: req.user.shareWithRecruiters || foundUser.shareWithRecruiters
                    , email: req.user.email ||  foundUser.email
                    , loginCount: req.user.loginCount + foundUser.loginCount
                    , admin: req.user.admin || foundUser.admin
                    , schedule: req.user.schedule || foundUser.schedule
                    , oauthInfo: {}
                  }
              var prop;
              if ( req.user.oauthInfo ){
                for(prop in req.user.oauthInfo){
                  if ( req.user.oauthInfo.hasOwnProperty(prop) ){
                    userUpdate.oauthInfo[prop] = req.user.oauthInfo[prop] || (foundUser.oauthInfo&&foundUser.oauth[prop])
                  }
                }
              }
              if (foundUser.oauthInfo){
                for(prop in foundUser.oauthInfo){
                  if ( foundUser.oauthInfo.hasOwnProperty(prop) ){
                    userUpdate.oauthInfo[prop] = foundUser.oauthInfo[prop] || (req.user.oauthInfo&&foundUser.oauth[prop])
                  }
                }
              }
              User.update({_id: newId}, {$set: userUpdate, $addToSet: {friends: {$each : foundUser.friends}}}, function(err, count){
                if (err){ console.log('UserChangeNew', err); }
                User.update({_id: {$in: foundUser.friends}}, {$addToSet: {friends: newId}}, {multi: true}, function(err, count){
                  if (err){ console.log('FriendsInformOfNewID', err); }
                  User.update({_id: {$in: foundUser.friends}}, {$pull: {friends: oldId}}, {multi: true}, function(err, count){
                    if (err){ console.log('FriendsRemoveOldId', err); }
                    User.findOne({_id: req.user._id}, function(err, user){
                      if (user){
                        res.json({
                              success: true
                            , redirect: '/'
                            , access_token: req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'')
                            , user_id: user.id
                            , user: user})
                      }else{
                        res.json({error: err});
                      }
                    })
                    foundUser.remove();
                  })
                })
              })
            })
          })
        })
      })
    })// End Initial Find of foundUser
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
      app.mixpanel.track('Picked School', {school: school.abbr, distinct_id: req.session.distinctId});
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
        , year: req.body.user.year
        , canEmailFriendRequests: req.body.user.canEmailFriendRequests=='true'
        , autoAcceptFriends: req.body.user.autoAcceptFriends=='true'
        , modified: new Date()
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
