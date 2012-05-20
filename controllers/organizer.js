/* 
 * Static site pages, including the main page and about pages 
 */
exports = module.exports = function(app){
	
	// organizer home
	app.get('/organizer', requireLogin, requireOrganizer, function(req, res){
		res.render('organizer/index', {});
	})
	
	app.get('/organizer/signup', requireLogin, function(req, res){
		res.render('organizer/signup', {});
	})
	app.get('/organizer/upgrade', requireLogin, function(req, res){
		user = req.user;
		user.organizer = true;
		user.save(function(err){
			if ( err ){
				console.log(err);
			}
			res.redirect('/organizer');
		})
	});
	
	app.get('/organizer/conference/create', requireLogin, function(req, res){
		console.log(req.user);
		req.user.save(function(err){
			err && console.log(err);
		});
		console.log(req.user);
//		res.render('organizer/conference/create', {});
	});
}
