exports.validatePresenceOf = function(val) {
	return val && val.length;
}

exports.requireSchool = function(req, res, next) {
	if ( !req.subdomain && ( !req.user || !req.user.school ) ){
		req.flash('message', 'Lets pick a school')
		res.redirect('/choose-school')
	}else if ( req.schoolObject ){
		next()
	}

	if ( req.subdomain ){
		if ( req.subdomain == 'c-76-17-122-184' ){
			req.subdomain = 'gatech'
		}
		School.findOne({ abbr: req.subdomain }).populate('currentTerm').run(function(err, school){
			if ( !school ){
				req.flash('message', 'Lets pick a school')
				res.redirect('/choose-school')
			}
			req.school = school
			next()
		})
	}else if ( req.user.school ){
		School.findOne({ _id: req.user.school }).populate('currentTerm').run(function(err, school){
			if ( !school ){
				req.flash('message', 'Lets pick a school')
				res.redirect('/choose-school')
			}
			req.school = school
			next()
		})
	}
}