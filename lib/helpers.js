everyauth = require('everyauth')

exports.boot = module.exports.boot = function(app){
  app.use(function(req, res, next){
    res.locals.request = req;
    res.locals.loggedIn = (req.session && req.session.auth && req.session.auth.loggedIn);
    res.locals.authToken = req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'');
    res.locals.hasMessages = (!req.session)?false:Object.keys(req.session.flash || {}).length;
    res.locals.messages = require('express-messages-bootstrap')(req);
    res.locals.domain = process.env.COURSESHARK_DOMAIN;
    res.locals.path = req['route']?req.route['path']:'';
    res.locals.base = ('/' == app.route) ? '' : app.route;
    res.locals.revision = app.settings.revision;
    res.locals.mode = app.settings.env;
    res.locals.distinctId = req.sessionID;
    res.locals.user = req.user || false;
    next();
  });


  app.locals.app = app;

  app.locals.numberize = function(number){
    var r = (''+number).substr(-1,1)
    return r==='1'?'st':r==='2'?'nd':r==='3'?'rd':'th'
  }
}