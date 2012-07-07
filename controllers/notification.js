var spanNumbers = function(n){
	return (''+n).split('').map(function(a){return '<span class="number">'+a+'</span>'}).join('');
}

exports = module.exports = function(app){
	var notification_io = app.io.of('/notifications')

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
			Notification.find({user: req.user}).populate('section').populate('section.course').populate('section.department').exec(function(err, notifications){
				res.json(notifications);
			})
		}else{
			Term.find({school: req.school, active: true}, function(err, terms){
				res.render('notifications/index', {user: req.user, school: req.school, terms:terms, noJS:true})
			})
		}
	})

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

	notification_io.on('connection', function (socket) {
		note = {}
		function transact(orderId){
			Credit.findOne({orderId: orderId}, function(err, credit){
				if( err || !credit ){
					socket.emit('error', 'usingCredit')
					return;
				}
				if ( credit.used===false ){
					note.save(function(err){
						if (err){
							socket.emit('error', err)
						}else{
							credit.used = true
							credit.usedOn = Date.now()
							credit.item = note._id
							credit.save(function(err){
								if ( !err ){
									socket.emit('activated', note)
								}else{
									socket.emit('error', err)
								}
							})
						}
					})
				}else{
					socket.emit('error', 'usingCredit')
				}
			})
		}

		socket.on('create', function(data){
			note = new Notification(data);
			Credit.findOne({user: data.user, used: false}, function(err, credit){
				if ( err ){
					socket.emit('error', err)
				}
				if ( !credit ){
					var jwt = require('jwt-simple')
						, time = Math.round((new Date()).getTime()/1000)
						,	payload = { iss: app.config.google.iss
												,	aud: 'Google'
												,	typ: 'google/payments/inapp/item/v1'
												,	exp: time + 3600 // 1 hour
												,	iat: time
												,	request: {name: 'Seat Watcher'
																	, description: 'Notification when a spot opens up in a class.'
																	,	price: 1.99
																	, currencyCode: 'USD'
																	,	sellerData: 'userId:'+note.user+';'
																	}
												}
					token = jwt.encode(payload, app.config.google.sellerSecret)
					socket.emit('payment_needed', {token:token});
					return;
				}
				// We have a credit
				transact(credit.orderId)
			})
			
		})
		socket.on('paid', transact)
	});
}
