var crc32 = require('./lib/crc32')
  , domain = '.courseshark.com';

// Defined in an or-ed list of ands
var rules = {};

function generateUniqueUserId(req){
  return Math.abs(crc32(req.session.distinctId))
}

function evaluateStatement(rule, req){
  var userData = req.session.flipflop
  if ( typeof rule == 'boolean'){
    return rule
  }else{
    if ( rule.match(/\{percent\s+([\d+\.]+)\}/i) ){
      // is a percent rule
      var percent = rule.match(/\{percent\s+([\d+\.]+)\}/)[1]
      if ( (userData.id % 1000)/10 <= percent ){
        return true;
      }else{
        return false;
      }
    }

    // {logged in} || {logged out}
    if ( rule.match(/\{logged\s+(in|out)\s*\}/i) ){
      var loggedIn = rule.match(/\{logged\s+(in|out)\s*\}/i)[1] == 'in'
        , sessionLoggedIn = !!(req.session.auth && req.session.auth.loggedIn)
      return loggedIn == sessionLoggedIn;
    }

    if ( rule.match(/\{is\s+(not)?\s*admin\s*\}/i) ){
      var admin = rule.match(/\{is\s+(not)?\s*admin\s*\}/i)[1] !== "not"
        , sessionAdmin = req.session.auth.loggedIn && req.user && req.user.admin
      return admin == sessionAdmin;
    }

    // Else no rule found
    console.log("FlipFlop Error: No logic for rule", rule);
    return false;
  }
}

exports.middleware = function (req, res, next) {
  if (!req.session.flipflop || !req.session.flipflop.id){
    if (req.cookies.guest_id){
      req.session.flipflop = {id: req.cookies.guest_id}
    }else{
      // Here we have no session info or cookie
      var id = generateUniqueUserId(req)
      tenYears = 3.156e11;
      res.cookie('guest_id', id, { domain: domain, signed: true, maxAge: tenYears, httpOnly: true });
      req.session.flipflop = {id: id}
    }
  }
  next();
}

exports.boot = function(app, mongoose, next){
  domain = '.'+app.config.domain;
  app.FlipFlop.find({}).exec(function(err, flipflopRules){
    if(err){
      console.error("Error loading FlipFlop rules", err)
    }
    for(var i=0,_len=flipflopRules.length; i<_len; i++){
      rules[flipflopRules[i].name] = flipflopRules[i].rules;
    }
    next();
  })
}

exports.test = function(ruleName, req){
  if ( typeof req === 'undefined' ){
    req = {}
  }
  var rule = rules[ruleName];
  if ( typeof rule === 'undefined' ){
    console.log('FlipFlop: Rule '+ruleName+' does not exist');
    return false;
  }
  if ( typeof rule !== 'object' ){
    console.log('FlipFlop: Rule '+ruleName+' setup improperly');
    return false;
  }
  if ( !rule.length ){
    console.log('FlipFlop: Empty rule set for '+ruleName);
    return false;
  }

  var i = 0
    , orLen = rule.length
    , res
  // For each OR chain
  do{
    // Evaluate the AND chain
    var j = 0
      , andLen = rule[i].length
      , andRes
    do{
      andRes = evaluateStatement(rule[i][j], req);
    } while (andRes && ++j<andLen)
    // Set the incremental or result
    res = res || andRes
  } while (!res && ++i<orLen) // Break on first acceptance of or chain
  return res
}