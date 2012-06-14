/*
 * Admin controller
 */
exports = module.exports = function(app){
	// Admin dashboard
	app.get('/admin/', function(req, res){
		res.render('admin/index', {});
	})
	app.get('/admin/users', function(req, res){
		res.render('admin/index', {});
	})

}
