var app = false
	,	url = require('url')

function randomHash(){
	var now = new Date()
	return (Math.floor(Math.random() * 10) + parseInt(now.getTime(), 10)).toString(36)
}

exports.boot = function(a){
	app = a
	app.createLink = createLink
}


exports.middleWare = function(req, res, next){
	console.log(req.session);

	if ( req.query.lr !== undefined ){
		app.Link.findOne({hash: req.query.lr}, function(err, link){
			req.link = link
			if ( req.link ){
				req.link.visits++
				req.link.save()
			}
			next()
		})
	}else{
		next()
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