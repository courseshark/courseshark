var app = false
  , url = require('url')

function randomHash(){
  var now = new Date()
  return (((1+Math.random())*0x10000000)|0).toString(34).substr(1)
}

exports.boot = function(a){
  app = a
  app.createLink = createLink
  app.getExistingLink = getExistingLink
}


exports.middleWare = function(req, res, next){
  req.session.initialReferer = req.session.initialReferer!==undefined ? req.session.initialReferer : req.header('Referer');
  req.session.distinctId = req.session.distinctId || req.sessionID;
  searchHash = req.query.lr || req.query.fb_ref;
  if ( typeof searchHash != 'undefined' && searchHash ){
    app.Link.findOne({hash: searchHash}, function(err, link){
      req.link = link
      if ( req.link ){
        req.session.link = req.session.link || link
        req.link.visits++
        req.link.save()
      }
      next()
    })
  }else{
    next()
  }
}

exports.trackReferal = function(session){
  socialLink = session.link;
  console.log('tracking social referal',(socialLink?'\n -> Found :: '+socialLink._id:session.initialReferer));
  if ( socialLink ){
    app.Link.update({hash: socialLink.hash}, {$inc: {referals: 1}}, function(err, num){
      console.log(err||num)
    })
  }
}

createLink = exports.createLink = function(to, user){
  var p
    , link
  link = new app.Link({to:to, hash: randomHash()})
  if ( user ){
    link.user = user
  }
  link.save()
  return link;
}


getExistingLink = exports.getExistingLink = function(to, user, next){
  app.Link.findOne({to:to, user:user}, function(err, link){
    if ( err || !link ){
      next(createLink(to, user))
    }else{
      next(link);
    }
  })
}