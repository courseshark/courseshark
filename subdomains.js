module.exports = function(req, res, next) {
		// get host & protocol
		var	host = req.headers.host
			, protocol = req.socket.encrypted ? 'https' : 'http'
		// remove 'www' prefix from URL
		if (/^www/.test(host)){
			res.redirect(protocol + '://' + host.replace(/^www\./, '') + req.url)
			return
		}
		// restrict 'admin'
		if (/^admin/.test(host) && ( !req.user || !req.user.admin ) ){
			req.flash('messgae', 'You are not an administrator')
			res.redirect(protocol + '://' + host.replace(/^admin\./, '') + req.url)
			return
		}
		host = host===undefined?'':host
		parts = host.split('.', 3)
		if ( parts.length === 3 ){
			req.subdomain = parts[0]
		}
		next();
	}