/*
 * New Backbone.js API endpoints
 */
var MandrillAPI = require('mailchimp').MandrillAPI
  , social = require('../lib/social-track')
  , userLib = require('../lib/user')
  , crawler = require('../lib/crawler')
  , flipflop = require('../lib/flipflop')
  , EventEmitter = require("events").EventEmitter


exports = module.exports = function(app){

  try {
    var mandrill = new MandrillAPI(app.config.COURSESHARK_MIXPANEL_ACCESS_TOKEN, { version : '1.0', secure: false });
  } catch (error) {
    console.log('Mandrill Error: ' + error);
  }

  app.post('/api/user/:id', requireLogin, function(req, res){
    if (req.user.id != req.params.id){
      res.json({error: 'Not Authorized'});
      return
    }
    else if ( req.body.updateName ){
      var nameSettings = req.body.updateName;
      req.user.firstName = nameSettings.firstName;
      req.user.lastName = nameSettings.lastName;
      req.user.save(function(err){
        if (err){ res.json({success: false, error: err}); return; }
        res.json({success: 1})
      })
    }
    else if ( req.body.updateEmail ){
      req.user.email = req.body.updateEmail.email
      req.user.save(function(err){
        if (err){ res.json({success: false, error: err}); return; }
        res.json({success: 1})
      })
    }
    else if ( req.body.changePassword ){
      var newPasswordSettings = req.body.changePassword
      if ((req.user.isPasswordless()||req.user.authenticate(newPasswordSettings.current)) && newPasswordSettings.password){
        req.user.setPassword(newPasswordSettings.password).save(function(err){
          if ( err ){
            res.json({success: false, error: err})
          }else{
            res.json({success: 1})
          }
        })
      }else{
        res.json({error: "Incorrect Current Password"})
      }
    }
    else if ( req.body.changeSchool ){
      School.findById(req.body.changeSchool.school, function(err, school){
        if ( err || !school ){
          res.json({error: err||'No School found'});
          return;
        }else{
          req.user.school = school;
          req.user.save(function(err){
            if(err){
              res.json({error: err});
            }else{
              res.json({success: 1})
            }
          })
        }
      })
    }
    else if ( req.body.updateEmailOnInvite ){
      req.user.canEmailFriendRequests = (req.body.updateEmailOnInvite.email=='true')
      req.user.save(function(err){
        if(err){
          res.json({error: err});
        }else{
          res.json({success: 1})
        }
      })
    }
    else if ( req.body.updateShareWithRecruiters ){
      req.user.shareWithRecruiters = (req.body.updateShareWithRecruiters.value=='true')
      console.log(req.body.updateShareWithRecruiters.value)
      req.user.save(function(err){
        if(err){
          res.json({error: err});
        }else{
          res.json({success: 1})
        }
      })
    }
    else {
      res.json(false);
    }
  })

  app.get('/me', function(req, res){
    if ( !req.loggedIn ){
      res.json(false)
    }else{
      user = userLib.cleanUserObject(req.user.toObject(), true);
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

  app.get('/api/schools', function(req, res){
    School.find({enabled: true}, function(err, schools){
      if ( err ){
        res.json({error: err});
      }else{
        res.json(schools)
      }
    })
  })

  app.put('/api/schools/:id', function(req, res){
    School.findOne({_id: req.params.id}, function(err, school){
      if ( school ){
        req.session.school = school;
        res.json(true)
        if ( req.loggedIn && !req.user.school ){
          req.user.school = school.id;
          req.user.save();
        }
      }else{
        res.json(false)
      }
    })
  })

  app.get('/api/terms/:id', function(req, res){
    var schoolId = req.params.id
    Term.find({school: schoolId}, function(err, terms){
      res.json(terms || {error: err});
    })
  })

  app.get('/api/settings', function(req, res){
    res.json(flipflop.evaluateAll(req))
  })


  app.get('/api/notifications', function(req, res){
    if(!req.loggedIn){
      return res.json([]);
    }
    Notification.find({user: req.user._id, hidden:false}).populate('section').exec(function(err, notifications){
      return res.json(notifications);
    });
  })

  app.post('/api/notifications', function(req, res){
    if(!req.loggedIn){
      return res.json({error: 'Must be logged in'});
    }
    note = new Notification();
    note.user = req.user || req.body.user;
    note.section = req.body.section;
    note.email = req.body.email;
    note.phone = req.body.phone;
    note.school = req.body.school;
    note.waitlist = !!req.body.waitlist;
    note.save(function(err){
      if (err){
        res.json({error: err})
      }else{
        res.json(note);
      }
    })
  })

  app.delete('/api/notifications/:id', function(req, res){
    if(!req.loggedIn){ return res.json({error: 'Must be logged in'}); }
    Notification.findOne({_id: req.params.id, user: req.user.id}).exec(function(err, note){
      if ( err ){ return res.json({error: err})}
      if ( !note ){ return res.json(true); }
      note.hidden = true;
      note.deleted = true;
      note.save(function(err){
        res.json(1);
      })
    })
  })


  // SEATS information non-live
  app.get('/api/seats/:sections', function(req, res){
    var sections = req.params.sections.split(',')
      , _len = sections.length
      , FIFTEEN_MINUTES = 1000 * 60 * 15
      , emitter = new EventEmitter()
    if ( !sections.length ){
      res.json(0)
    }else{
      // Setup the emitter
      emitter.count   = _len;
      emitter.results = [];
      emitter.on('result', function(d){
        emitter.results.push(d);
        if (--emitter.count <= 0){
          res.json(emitter.results);
        }
      });

      // Loop thought the sections updating them.
      for(var i=0;i<_len;i++){
        Section.findById(sections[i]).exec(function(err, section){
          Term.findById(section.term).populate('school').exec(function(err, term){
            if ( term.active ){
              crawler[term.school.abbr].safeUpdateSection(section, FIFTEEN_MINUTES, function(err, section){
                emitter.emit('result', {
                    id: section.id
                  , seatsAvailable: section.seatsAvailable
                  , seatsTotal: section.seatsTotal
                  , waitSeatsAvailable: section.waitSeatsAvailable
                  , waitSeatsTotal: section.waitSeatsTotal
                })
              })
            }else{
              var avail = section.seatsAvailable?section.seatsAvailable:'-'
                , total = section.seatsTotal?section.seatsTotal:'?';
              emitter.emit('result', {
                    id: section.id
                  , seatsAvailable: section.seatsAvailable
                  , seatsTotal: section.seatsTotal
                  , waitSeatsAvailable: section.waitSeatsAvailable
                  , waitSeatsTotal: section.waitSeatsTotal
              })
            }
          })
        })
      }
    }
  })




};