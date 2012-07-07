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
				res.render('friends/results', {users: [], search: req.params.name, error: 'Too few characters'})
	})

	app.get('/friends/search/:name.:format?', requireLogin, function(req, res){
		query = req.params.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/gi, '|').replace(/\\/, '\\').replace(/[^\\]\./,'\\.')
		if ( query.length < 3 ){
			if ( req.params.format == 'json' ){
				res.json({query: query, users:[]})
			}else{
				res.render('friends/results', {users: [], search: req.params.name, error: 'Too few characters'})
			}
			return;
		}
		re = new RegExp(query, 'gi')
		User.find({school: req.user.school, $or:[{email: re}, {firstName: re}, {lastName: re}] }, function(err, users){
			users = users.map(function(u){return {id:u.id, name:u.name, email:u.email.replace(/@.+/gi,''), avatar:u.avatar(30)}})
			if ( req.params.format == 'json' ){
				res.json({query: query, users: users})
			}else{
				res.render('friends/results', {users: users, search: req.params.name})
			}
		})
	})

	app.post('/friends/:friendId.:format?', requireLogin, function(req, res){
		User.findById(req.params.friendId, function(err, friend){
			if ( err ){ res.json(false); return; }
			if ( !friend ) { res.json(false); return; }
			User.update({_id: req.user._id}, {$addToSet: {friends: req.params.friendId}}, function(err, num){
				if ( err ){ res.json(false); return; }
				res.json(true);
				// Email friend about invite
			})
		})
	})

	app.delete('/friends/:friendId.:format?', requireLogin, function(req, res){
		var friendId = req.params.friendId.replace(/[^0-9a-z]/ig, '')
		User.update({_id: req.user.id}, {$pull:{friends:friendId}}, function(err, num){
			User.update({_id: String(friendId)}, {$pull:{friends:req.user._id}}, function(err,num){
				res.json(true)
			})
		})
	})

}