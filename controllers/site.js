/*
 * Static site pages, including the main page and about pages
 */
exports = module.exports = function(app){
	// Home
	app.get('/', function(req, res){
		if ( req.loggedIn ){
			require('../lib/social-track').getExistingLink('http://courseshark.com/', req.user, function(link){
				res.render('index', {raffleLink: link});
			})
		}
		else{
			res.render('index', {});
		}
	})

	// About pages
	app.get('/about', function(req, res){
		if ( req.headers['x-requested-with'] === 'XMLHttpRequest' ){
			res.render('dialogs/about')
		}else{
			res.render('about/index')
		}
	})

	app.get('/about/terms', function(req, res){
		res.render('about/terms', {});
	})

	app.get('/about/privacy', function(req, res){
		res.render('about/privacy', {});
	})

	app.get('/about/feedback', function(req, res){
		res.render('dialogs/feedback', {});
	})

}
