/*
 * Recruiter experiment
 */
exports = module.exports = function(app){
	// Home
	app.get('/giveaway', function(req, res){
		req.flash('info', 'Sorry, the giveaway has ended. But dont let that keep you from making your <a href="/schedule">schedule!</a>');
		res.redirect('/');
	});
}
