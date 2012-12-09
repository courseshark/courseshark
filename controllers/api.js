/*
 * New Backbone.js API endpoints
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





  app.get('/api/schools', function(req, res){
    School.find({enabled: true}, function(err, schools){
      if ( err ){
        res.json({error: err});
      }else{
        res.json(schools)
      }
    })
  })
};