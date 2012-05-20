/* 
 * Static site pages, including the main page and about pages 
 */
exports = module.exports = function(app){
	// Home
	app.get('/', function(req, res){
		res.render('index', {});
	})
	
	// About pages
	app.get('/about', function(req, res){
		res.render('about/index', {});
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
