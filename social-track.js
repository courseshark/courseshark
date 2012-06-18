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
	if ( req.query.lRef !== undefined ){
		app.Link.findOne({hash: req.query.lRef}, function(err, link){
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
	console.log(p);
	if ( ! p.search || p.search === '' ){
		return to+'?lRef='+link.hash
	}else{
		return to+'&lRef='+link.hash
	}
}