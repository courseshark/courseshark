var app = false
	,	url = require('url')

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
	if ( req.query.lr !== undefined ){
		app.Link.findOne({hash: req.query.lr}, function(err, link){
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
	socialLink = session.initialReferer.match(/[\&|\?]lr=([0-9a-z]+)/i)
	if ( socialLink && socialLink.length >= 2 ){
		Link.update({hash: socialLink[1]}, {$inc: {referals: 1}}, function(err, num){
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
	p = url.parse(to)
	if ( ! p.search || p.search === '' ){
		return to+'?lr='+link.hash
	}else{
		return to+'&lr='+link.hash
	}
}


getExistingLink = exports.getExistingLink = function(to, user, next){
	app.Link.findOne({to:to, user:user}, function(err, link){
		if ( err || !link ){
			next(createLink(to, user))
		}else{
			var p = url.parse(link.to)
			if ( ! p.search || p.search === '' ){
				next(to+'?lr='+link.hash)
			}else{
				next(to+'&lr='+link.hash)
			}
		}
	})
}