var spanNumbers = function(n){
	return (''+n).split('').map(function(a){return '<span class="number">'+a+'</span>'}).join('');
}

exports = module.exports = function(app){

	app.get('/watcher', function(req, res){
		Notification.find().count().exec(function(err, total){
			Notification.find({deleted: false, hidden:false}).count().exec(function(err, active){
				NotificationFeedback.find({ignore:false}).count().exec(function(err, feedBackCount){
					NotificationFeedback.find({success:true,ignore:false}).count().exec(function(err, successNumber){
						success = Math.round((feedBackCount>0?successNumber / feedBackCount:0)*1000)/10 + '%'
						res.render('watcher/index', {total:spanNumbers(total), active:spanNumbers(active), success:spanNumbers(success)})
					})
				})
			})
		})
	})

	app.get('/notifications.:format?', requireLogin, requireSchool, function(req, res){
		if ( req.params.format === 'json' ){
			Notification.find({user: req.user, hidden:false}).populate('section').populate('section.course').populate('section.department').exec(function(err, notifications){
				list = []
				for(var i=0,len=notifications.length; i<len; i++){
					list.push(notifications[i].toJSON2())
				}
				res.json(list);
			})
		}else{
			Term.find({school: req.school, active: true}, function(err, terms){
				res.render('notifications/index', {user: req.user, school: req.school, terms:terms, noJS:true})
			})
		}
	})

	app.put('/notifications/:notificationId.:format?', requireLogin, function(req, res){
		Notification.findOne({user: req.user, _id:req.params.notificationId}, function(err, notification){
			if (err||!notification){
				if ( req.params.format == 'json' ){
					res.json(false);
				}
			}else{
				console.log(notification);
				notification.email = req.body.notification.email
				notification.phone = req.body.notification.phone
				notification.save(function(err){
				});
				if ( req.params.format == 'json' ){
					res.json(true);
				}else{
					res.redirect('back')
				}
			}
		})
	})

	app.delete('/notifications/:notificationId.:format?', requireLogin, function(req, res){
		Notification.findOne({user: req.user, _id:req.params.notificationId}, function(err, notification){
			if (err||!notification){
				if ( req.params.format == 'json' ){
					res.json(false);
				}else{
					res.send(404);
				}
			}else{
				notification.hidden = true;
				notification.deleted = true;
				notification.save(function(err){
					if ( req.params.format == 'json' ){
						res.json(err||true);
					}else{
						res.redirect('back')
					}
				});
			}
		})
	})

	app.post('/notifications', requireLogin, function(req, res){
		note = new Notification(req.body.notification);
		note.user = req.user;
		note.save(function(err){
			res.json(err||true);
		})
	})

/*
	app.post('/notifications/purchase/post-back', function(req, res){
		var jwt = req.body.jwt
			,	transaction = require('jwt-simple').decode(jwt, app.config.google.sellerSecret)
			,	time = Math.round((new Date()).getTime()/1000)
			, credit = new Credit()
		if ( transaction.request.exp < time ){
			res.json()
			return;
		}
		if ( transaction.request.price !== '1.99'){
			res.json()
			return;
		}

		credit.user = transaction.request.sellerData.replace('userId:', '').replace(';','')
		credit.orderId = transaction.response.orderId
		credit.save(function(err){
			res.json(transaction.response.orderId)
		})
	})
*/


	app.get('/notification/cancel/:userId/:notificationId/:sectionId.:format?', function(req, res){
		function fail(message){
			if (req.params.format === 'json'){
				res.json({success:false, message:message});
			}else{
				req.flash('error',message||'Could not delete notification.')
				res.redirect('/notifications')
			}
		}
		function success(){
			if ( req.params.format === 'json'){
				res.json(true);
			}else{
				res.redirect('/notifications')
			}
		}
		User.findById(req.params.userId, function(err, user){
			if (err || !user){fail('Invalid URL');return;}
			Notification.findById(req.params.notificationId, function(err, notification){
			if (err || !notification){fail('Invalid URL');return;}
				if (notification.deleted){
					success()
					return;
				}
				if ( req.params.sectionId==notification.section ){
					notification.deleted = true;
					notification.save()
					success()
					return;
				}else{
					fail('Invalid URL')
					return;
				}
			})
		})
	})


	app.get('/notification/reactivate/:userId/:notificationId/:sectionId.:format?', function(req, res){
		function fail(message){
			if (req.params.format === 'json'){
				res.json({success:false, message:message});
			}else{
				req.flash('error',message||'Could not delete notification.')
				res.redirect('/notifications')
			}
		}
		function success(){
			if ( req.params.format === 'json'){
				res.json(true);
			}else{
				res.redirect('/notifications')
			}
		}
		User.findById(req.params.userId, function(err, user){
			if (err || !user){fail('Invalid URL');return;}
			Notification.findById(req.params.notificationId, function(err, notification){
			if (err || !notification){fail('Invalid URL');return;}
				if (!notification.deleted){
					success()
					return;
				}
				if ( req.params.sectionId==notification.section ){
					notification.hidden = false;
					notification.deleted = false;
					notification.save()
					success()
					return;
				}else{
					fail('Invalid URL')
					return;
				}
			})
		})
	})

	app.get('/notification/remove/:userId/:notificationId/:sectionId.:format?', function(req, res){
		function fail(message){
			if (req.params.format === 'json'){
				res.json({success:false, message:message});
			}else{
				req.flash('error',message||'Could not delete notification.')
				res.redirect('/notifications')
			}
		}
		function success(){
			if ( req.params.format === 'json'){
				res.json(true);
			}else{
				res.redirect('/notifications')
			}
		}
		User.findById(req.params.userId, function(err, user){
			if (err || !user){fail('Invalid URL');return;}
			Notification.findById(req.params.notificationId, function(err, notification){
			if (err || !notification){fail('Invalid URL');return;}
				if (notification.hidden){
					success()
					return;
				}
				if ( req.params.sectionId==notification.section ){
					notification.hidden = true;
					notification.deleted = true;
					notification.save()
					success()
					return;
				}else{
					fail('Invalid URL')
					return;
				}
			})
		})
	})

	app.get('/notification/remove/:userId/:notificationId/:sectionId.:format?', function(req, res){
		function fail(message){
			if (req.params.format === 'json'){
				res.json({success:false, message:message});
			}else{
				req.flash('error',message||'Could not delete notification.')
				res.redirect('/notifications')
			}
		}
		function success(){
			if ( req.params.format === 'json'){
				res.json(true);
			}else{
				res.redirect('/notifications')
			}
		}
		User.findById(req.params.userId, function(err, user){
			if (err || !user){fail('Invalid URL');return;}
			Notification.findById(req.params.notificationId, function(err, notification){
			if (err || !notification){fail('Invalid URL');return;}
				if (notification.hidden){
					success()
					return;
				}
				if ( req.params.sectionId==notification.section ){
					notification.hidden = true;
					notification.deleted = true;
					notification.save()
					success()
					return;
				}else{
					fail('Invalid URL')
					return;
				}
			})
		})
	})

}
