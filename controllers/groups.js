/* 
 * Pages relating to group creation and management
 */
exports = module.exports = function(app){
	
	app.param('id', function(req, res, next, id){
		app.Group
			.findById(id)
			.populate('creator')
			.populate('members', ['username', '_id'])
			.run(function(err,group) {
				if (err) return next(err);
				if (!group) return next(new Error('Failed to load group ' + id));
				req.group = group;
				next();
		})
	})
	
	
	// Get the groups for this user
	app.get('/groups.?:page?.:format?', requireLogin, function(req, res){
		app.Group.find().limit(10).skip(10*parseInt(req.params.page)||0).run(function(err, groups){
			if ( req.params.format === "json" ){
				res.json(groups);
			}else{
				res.render('groups/index', {groups: groups});
			}
		});
	})
	
	// Get the groups for this user
	app.get('/groups/mine.:format?', requireLogin, function(req, res){
		app.Group.find({creator: req.user.id}, function(err, groups){
			if ( req.params.format === "json" ){
				res.json(groups);
			}else{
				res.render('groups/index', {groups: groups});
			}
		});
	})
	
	// Create New
	app.post('/groups', requireLogin, function(req, res){
		var group = new app.Group(req.body.group);
		group.creator = req.user.id;
		group.members.push(req.user.id);
		group.save(function(err, newGroup){
			if ( err ){
				req.flash("error", "Something went wrong in saving")
				res.redirect('/groups/new');
			}else{
				res.redirect('/groups/'+newGroup.id);
			}
		});
	})
	
	// New Form
	app.get('/groups/new', requireLogin, function(req, res){
		res.render('groups/new', {group: new app.Group()} );
	})
	
	// View the Group Details
	app.get('/groups/:id.:format?', requireLogin, function(req, res){
		var group = req.group;
		if ( req.params.format === "json" ){
			res.json(group);
		}else{
			res.render('groups/view', {group:group, member: group.isMember(req.user), creator: group.creator.id==req.user.id});
		}
	})
	
	// Edit the Group Details
	app.put('/groups/:id.:format?', requireLogin, function(req, res){
		var group = req.group;
		if (group.creator.id === req.user.id){
			var updateData = req.body.group;
			updateData.isPublic = !!(req.body.group.isPublic);
			updateData.membersInvite = !!(req.body.group.membersInvite);
			updateData.modified = new Date();
			app.Group.update({_id: group.id}, updateData, function(err, num){
				console.log(err, num);
				if ( err ){
					req.flash('notice', 'Something went wrong updating');
				}else{
					req.flash('success', 'Updated successfully');
				}
			})
		}else{
			req.flash('error', 'You cannot make changes to this group');
		}
		
		res.redirect('/groups/'+group.id);
	})
	
	// Edit a Group
	app.get('/groups/:id/edit', requireLogin, function(req, res){
		if ( req.group.creator.id!==req.user.id )
			res.redirect('back');
		res.render('groups/edit', {group:req.group});
	})
	
	
	// View the Group Details
	app.get('/groups/:id/join', requireLogin, function(req, res){
		var group = req.group;
		group.isMember(req.user) || ( group.members.push(req.user.id), group.save() );
		res.redirect('/groups/'+group.id)
	})
	
	// Leave the group
	app.get('/groups/:id/leave', requireLogin, function(req, res){
		var group = req.group;
		!group.isMember(req.user) || ( group.removeMember(req.user), group.save() )
		res.redirect('/groups/'+group.id)
	})
	
}
