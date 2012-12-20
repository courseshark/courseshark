var crc32 = require('./lib/crc32')
  , domain = '.courseshark.com'
  , FlipFlop

// Defined in an or-ed list of ands
var rules = {};

function generateUniqueUserId(req){
  return Math.abs(crc32(req.session.distinctId+Date.now()))
}

function preProcessSessionUserData(ruleName, sessionData){
  result = {}
  for(var key in sessionData){
    result[key] = sessionData[key];
  }
  if ( !rules[ruleName].offsetPercent ){
    rules[ruleName].offsetPercent = (Math.abs(crc32(rules[ruleName].id+Date.now())) % 1000 / 10)
    rules[ruleName].save()
  }
  result.id += rules[ruleName].offsetPercent
  return result;
}

function evaluateStatement(rule, ruleName, req){

  if ( typeof rule == 'boolean'){
    return rule
  }else{

    // {if [rule]} {if not [rule]}
    if ( rule.match(/\{if\s+(not)?\s*([a-z0-9\_\-]+)\s*\}/i) ){
      var matches = rule.match(/\{if\s+(not)?\s*([a-z0-9\_\-]+)\s*\}/i)
        , is = matches[1] === "not"
        , depName = matches[2]
      return is == exports.test(depName, req)
    }

    // {percent [float]}
    if ( rule.match(/\{percent\s+([\d+\.]+)\}/i) ){
      // is a percent rule
      var userData = preProcessSessionUserData(ruleName, req.session.flipflop)
        , percent = rule.match(/\{percent\s+([\d+\.]+)\}/)[1]
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

    // {is admin} || {is not admin}
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
      res.cookie('guest_id', id, { domain: domain, path: '/', signed: true, maxAge: tenYears, httpOnly: true });
      req.session.flipflop = {id: id}
    }
  }
  next();
}

exports.boot = function(app, mongoose, next){
  domain = '.'+app.config.domain;
  FlipFlop = app.FlipFlop
  FlipFlop.find({}).exec(function(err, flipflopRules){
    if(err){
      console.error("Error loading FlipFlop rules", err)
      next();
    }
    for(var i=0,_len=flipflopRules.length; i<_len; i++){
      rules[flipflopRules[i].name] = flipflopRules[i];
    }
    next();
  })
}

exports.test = function(ruleName, req){
  if ( typeof req === 'undefined' ){
    req = {}
  }
  var flipper = rules[ruleName];
  if ( typeof flipper === 'undefined' ){
    console.log('FlipFlop: Rule '+ruleName+' does not exist');
    return false;
  }
  if ( typeof flipper !== 'object' ){
    console.log('FlipFlop: Rule '+ruleName+' setup improperly');
    return false;
  }
  if ( !flipper.rules.length ){
    console.log('FlipFlop: Empty rule set for '+ruleName);
    return false;
  }

  var i = 0
    , orLen = flipper.rules.length
    , res
  // For each OR chain
  do{
    // Evaluate the AND chain
    var j = 0
      , andLen = flipper.rules[i].length
      , andRes
    do{
      andRes = evaluateStatement(flipper.rules[i][j], ruleName, req);
    } while (andRes && ++j<andLen)
    // Set the incremental or result
    res = res || andRes
  } while (!res && ++i<orLen) // Break on first acceptance of or chain


  // Update the rule
  FlipFlop.findOne({name: ruleName}).limit(1).exec(function(err, rule){
    if ( rule ) { rules[ruleName] = rule; }
  })

  return res
}



exports.evaluateAll = function(req){
  var result = {}
  for(var ruleName in rules){
    result[ruleName] = exports.test(ruleName, req);
  }
  return result
}