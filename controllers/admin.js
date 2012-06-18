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

	app.get('/admin/links', /*requireAdmin,*/ function(req, res){
		Link.find(req.query.link).populate('user').run(function(err, links){
			res.render('admin/links/index', {links: links, layout:'../layout.ejs'});
		})
	})
	app.post('/admin/links', /*requireAdmin,*/ function(req, res){
		console.log(req.body)
		link = new Link(req.body.link)
		console.log(link)
		link.save()
		res.redirect('/links')
	})

	app.delete('/admin/links/:linkId', /*requireAdmin,*/ function(req, res){
		Link.findOne({_id: req.params.linkId}, function(err, link){
			if ( !err && link ){
				link.remove()
			}
			res.redirect('/links')
		})
	})
}
