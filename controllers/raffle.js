/*
 * Recruiter experiment
 */
exports = module.exports = function(app){
	// Home
	app.get('/giveaway', function(req, res){
		if ( req.loggedIn ){
			require('../lib/social-track').getExistingLink('http://courseshark.com/', req.user, function(link){
				res.render('raffle/index', {raffleLink: link});
			})
		}
		else{
			res.render('raffle/index', {});
		}
	});
}
