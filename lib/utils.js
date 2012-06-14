exports.validatePresenceOf = function(val) {
	return val && val.length;
}

pickSchoolRedirect = function(req, res){
	req.flash('message', 'Lets pick a school')
	req.session.schoolNeeded = req.url
	res.redirect('/choose-school')
}

exports.requireSchool = function(req, res, next) {
	if ( !req.subdomain && ( !req.user || !req.user.school ) ){
		pickSchoolRedirect(req, res)
	}else if ( req.school ){
		next()
	}

	if ( req.subdomain ){
		School.findOne({ abbr: req.subdomain }).populate('currentTerm').run(function(err, school){
			if ( !school ){
				pickSchoolRedirect(req, res)
			}
			req.school = school
			next()
		})
	} else if ( req.user.school ){
		School.findById(req.user.school).populate('currentTerm').run(function(err, school){
			if ( !school ){
				pickSchoolRedirect(req, res)
			}
			req.school = school
			console.log(school);
			next()
		})
	}
}