/*
 * User management site pages
 */
exports = module.exports = function(app){
	// home
	app.get('/friends.:format?', requireLogin, function(req, res){
		req.user.getFriends(function(err, friends){
			req.user.getInvites(function(err, invites){
				req.user.getInvited(function(err, invited){
					if ( req.params.format == 'json' ){
						res.json(friends)
					}else{
						res.render('friends/index', { friends: friends, invites: invites, invited: invited, noJS: true })
					}
				})
			})
		})
	})

	app.get('/friends/add', requireLogin, function(req, res){
		res.render('friends/dialogs/add')
	})

	app.get('/friends/search', requireLogin, function(req, res){
		console.log('here');
	})

	app.get('/friends/search/:name.:format?', requireLogin, function(req, res){
		query = req.params.name.replace(/[^a-z0-9\s]/gi, '').replace(/\\/, '\\').replace(/[^\\]\./,'\\.')
		if ( query.length < 3 ){
			if ( req.params.format == 'json' ){
				res.json({query: query, users:[]})
			}else{
				res.render('friends/results', {users: [], search: req.params.name, error: 'Too few characters'})
			}
			return;
		}
		re = new RegExp(query, 'gi')
		console.log(re);
		User.find({school: req.user.school, $or:[{email: re}, {firstName: re}, {lastName: re}] }, function(err, users){
			users = users.map(function(u){return {id:u.id, name:u.name, email:u.email.replace(/@.+/gi,''), avatar:u.avatar(30)}})
			if ( req.params.format == 'json' ){
				res.json({query: query, users: users})
			}else{
				res.render('friends/results', {users: users, search: req.params.name})
			}
		})
	})

	app.post('/friends/:friendId.:format', requireLogin, function(req, res){
		console.log('adding', req.params.friendId);
	})

	app.delete('/friends/:friendId.:format?', requireLogin, function(req, res){
		console.log('deleting', req.params.friendId);
	})

}