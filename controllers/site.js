/*
 * Static site pages, including the main page and about pages
 */
exports = module.exports = function(app){
	// Home
	app.get('/', function(req, res){
		School.find({enabled: true}, {name:1, abbr:1}).exec(function(err, schools){
			res.render('index', {schools: schools});
		})
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
