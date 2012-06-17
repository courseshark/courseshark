/*
 * Admin controller
 */
exports = module.exports = function(app){
	// Admin dashboard
	app.get('/admin', /*requireAdmin,*/ function(req, res){
		res.render('admin/index', {});
	})

	app.get('/admin/schools', /*requireAdmin,*/ function(req, res){
		School.find({}).run(function(err, schools){
			res.render('admin/schools/index', {schools: schools, layout:'../layout.ejs'});
		})
	})

	app.get('/admin/users', /*requireAdmin,*/ function(req, res){
		User.find(req.query.user).populate('school').run(function(err, users){
			res.render('admin/users/index', {users: users, layout:'../layout.ejs'});
		})
	})

}
