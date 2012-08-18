/*
 * Recruiter experiment
 */
exports = module.exports = function(app){
	// Home
	app.get('/raffle', function(req, res){
		res.render('raffle/index');
	});
}
