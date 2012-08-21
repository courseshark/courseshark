/*
 * Admin controller
 */
var EventEmitter = require("events").EventEmitter
	,	seatWatcher = require('../lib/seat-watcher')

exports = module.exports = function(app){

	// Admin dashboard
	app.get('/admin', requireAdmin, function(req, res){
		User.count().exec(function(err,totalUsers){
			var weekAgo = new Date(Date.now()-1000*60*60*24*7);
			User.count({created: {$gte: weekAgo}}).exec(function(err, newUsersThisWeek){
				/// growth as percentage with two decimal points
				var userGrowth = Math.round(newUsersThisWeek / totalUsers * 10000)/100;

				// Experiment numbers
				User.count({shareWithRecruiters: true}).exec(function(err, yesToShare){
					User.count({shareWithRecruiters: false}).exec(function(err, noToShare){
						res.render('admin/index', {
								totalUsers: totalUsers
							, newUsersThisWeek: newUsersThisWeek
							, userGrowth: userGrowth
							, yesToShare: yesToShare
							, noToShare: noToShare
						})
					})
				})
			})
		})
	})

	app.get('/admin/notifications', requireAdmin, function(req, res){
		Notification.count({}).exec(function(err, count){
			Notification.find({hidden: false, deleted: false}, {}, {$sort: {_id: -1}})
				.populate('section')
				.populate('school')
				.populate('user')
				.exec(function(err, notifications){
					res.render('admin/notifications/index', {count: count, notifications: notifications, layout:'../layout.ejs'})
				})
		})
	})

	app.get('/admin/schools', requireAdmin, function(req, res){
		School.find({}).exec(function(err, schools){
			res.render('admin/schools/index', {schools: schools, layout:'../layout.ejs'});
		})
	})
	app.get('/admin/schools/:school/toggle-enabled', requireAdmin, function(req, res){
		res.json(true)
		School.findOne({_id:req.params.school}).exec(function(err, school){
			if (school){
				school.enabled = !school.enabled
				school.save(function(err){
				})
			}
		})
	})
	app.get('/admin/schools/:school/toggle-notifications', requireAdmin, function(req, res){
		res.json(true)
		School.findOne({_id:req.params.school}).exec(function(err, school){
			if (school){
				school.notifications = !school.notifications
				school.save(function(err){
					if ( school.notifications ){
						seatWatcher.startSchool(school)
					}else{
						seatWatcher.stopSchool(school)
					}
				})
			}
		})
	})
	app.get('/admin/schools/:school', requireAdmin, function(req, res){
		School.findOne({_id:req.params.school}).populate('terms').exec(function(err, school){
			if ( !school ){ res.redirect('back'); }
			res.render('admin/schools/school', {school: school, layout:'../layout.ejs'});
		})
	})


	app.get('/admin/terms/:term/toggle-active', requireAdmin, function(req, res){
		res.json(true)
		Term.findOne({_id:req.params.term}).exec(function(err, term){
			if (term){
				term.active = !term.active
				term.save()
			}
		})
	})

	app.get('/admin/users', requireAdmin, function(req, res){
		User.find(req.query.user, {}, {sort: {created:-1}}).limit(10).populate('school').exec(function(err, users){
			User.count(req.query.user, function(err, count){
				res.render('admin/users/index', {users: users, count: count, layout:'../layout.ejs'});
			})
		})
	})

	app.get('/admin/links', requireAdmin, function(req, res){
		Link.find(req.query.link).populate('user').exec(function(err, links){
			res.render('admin/links/index', {links: links, layout:'../layout.ejs'});
		})
	})
	app.post('/admin/links', requireAdmin, function(req, res){
		console.log(req.body)
		link = new Link(req.body.link)
		console.log(link)
		link.save()
		res.redirect('/links')
	})

	app.delete('/admin/links/:linkId', requireAdmin, function(req, res){
		Link.findOne({_id: req.params.linkId}, function(err, link){
			if ( !err && link ){
				link.remove()
			}
			res.redirect('/links')
		})
	})

	app.get('/admin/launch', requireAdmin, function(req, res){
		School.find({}, {}, {sort:{abbr:1}}).exec(function(err, schools){
			res.render('admin/launch/index', {schools: schools, layout:'../layout.ejs'})
		})
	})

		app.get('/admin/recruiter/class-search', requireAdmin, function(req, res){

		var collector = new (require( "events" ).EventEmitter)()
			,	classesByUser = [];

		collector.on('decrement', function(){
			if(--this.count===0){ this.emit('done') }
		})

		// Display the results
		collector.on('done', function(){
			res.render('admin/recruiters/search', {results:classesByUser, layout:'../layout.ejs'});
			//res.json(classesByUser);
		})

		User.find({shareWithRecruiters: true}).populate('school').exec(function(err, users){
			collector.count = users.length;
			for(var i=0,len=users.length; i<len; i++){
				getUserSections(users[i]);
			}
		})
		
		function getUserSections(user){
			var o={};
			o.query = {user: user._id};
			o.map = function () { emit(this._id, {sections: this.sections}) };
			o.reduce = function (k, vals) {
				var sections=[];
				for(var i=0;i<vals.length;i++){
					for(var j=0;j<vals[i].sections.length;j++){
						sections.push(vals[i].sections[j]['_id']?vals[i].sections[j]['_id']:vals[i].sections[j])
					}
				}
				return {sections: sections};
			};
			o.verbose = true;
			Schedule.mapReduce(o, function (err, results) {
				sectionsList = results.reduce(function(list, current){
					current.value.sections.map(function(e){ list.push(e['_id']?e['_id']:e); });
					return list; }, []);
				//console.log(sectionsList.length==47?sectionsList:'');
				Section.find({_id: {$in:sectionsList} }).populate('course').populate('term').populate('department').exec(function(err, sections){
					classesByUser.push({user:user, sections: sections});
					collector.emit('decrement');
				})
			});
		}
	});

	app.get('/admin/giveaway', requireAdmin, function(req, res){
		var dateRange = {
				$gte: new Date('2012-08-19T23:00:00.000Z')
			, $lte: new Date('2012-09-03T04:01:00.000Z')
		}

		var o = {};
		o.query = {createdOn: dateRange, user: {$ne: undefined}};
		o.map = function () { emit(this.user, {referals: this.referals, visits: this.visits, schedule: !!this.to.match(/\/sl\//) }) };
		o.reduce = function (k, vals) {
			var ref=0,vis=0,sch=0;
			for(var i=0;i<vals.length;i++ ){
				ref += vals[i].referals;
				vis += vals[i].visits;
				sch += vals[i].schedule;
			}
			return {referals: ref, visits: vis, schedule: sch};
		};
		o.verbose = true;
		Link.mapReduce(o, function (err, results) {

			var collector = new (require( "events" ).EventEmitter)()
				,	users = [];

			collector.count = results.length;
			for(var i=0,len=results.length; i<len; i++){
				(function(res){
					User.findById(res._id).exec(function(err, user){
						vals = res.value;
						vals.schedule=vals.schedule>0?1:0;
						vals.recruiters=(user.shareWithRecruiters?1:0);
						vals.points = vals.referals + (vals.schedule*2) + vals.recruiters;
						users.push({user: user, values:vals})
						collector.emit('decrement');
					})
				})(results[i]);
			}
			collector.on('decrement', function(){
				if(--this.count===0){ this.emit('done') }
			})

			// Display the results
			collector.on('done', function(){
				users.sort(function(a,b){return b.values.points-a.values.points})
				res.json(users);
			})
		})

	});
}
