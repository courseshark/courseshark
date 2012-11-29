/*
 * User management site pages
 */
exports = module.exports = function(app){
  // home
  app.get('/friends.:format?', requireLogin, function(req, res){
    req.user.getFriends(function(err, friends){
      req.user.getUsersIRequestedToByMyFriend(function(err, invites){
        req.user.getFriendRequests(function(err, invited){
          if ( req.params.format == 'json' ){
            res.json(friends)
          }else{
            res.render('friends/index', { friends: friends, invites: invites, invited: invited, noJS: true })
          }
        })
      })
    })
  })

  // Find the user's friends with a facebook request
  app.get('/friends/find-from-facebook', requireLogin, function(req, res){
    if (req.session.auth.facebook) {
      var buffer = (new (require('events').EventEmitter)())
        , sessionFB = req.session.auth.facebook
        , FB = require('FB')
      FB.options({accessToken: sessionFB.accessToken});
      FB.api('me/friends', { fields: ['id', 'first_name', 'last_name', 'name', 'installed'] }, function (fbRes) {
        if(!fbRes || fbRes.error) {
          fbRes = !fbRes ? {error:'No Results'} : fbRes;
          res.json(fbRes);
          return;
        }
        fbRes.data = fbRes.data.filter(function(d){ return d.installed; })
        fbIds = fbRes.data.map(function(d){return {$or: [{'oathInfo.facebook.id': d.id},{'firstName': d.first_name, 'lastName': d.last_name}]}; })
        buffer.count = fbIds.length;
        for(var i in fbIds){
          User.find(fbIds[i], function(search){ return function(err, foundUsers){
            var fbId = search['$or'][0]['oathInfo.facebook.id'];
            if (err || !foundUsers || !foundUsers.length){
              buffer.emit('+', null);
              return;
            }
            if ( foundUsers.length === 1 ){
              // Found only one user, it must be them.
              buffer.emit('+', foundUsers[0], fbId);
              return;
            }else{
              // Found multiple users with our search
              for(var i=0,_len=foundUsers.length;i<_len;i++){
                if(foundUsers[i].oauthInfo && foundUsers[i].oauthInfo.facebook && foundUsers[i].oauthInfo.facebook.id==fbId){
                  // Found the one that has the facebook iD
                  buffer.emit('+', foundUsers[0], fbId);
                  return;
                }
              }
              // Found multiple users and none match the ID facebook told us
              buffer.emit('+', null);
              return;
            }
          }}(fbIds[i]))
        }
      });

      // Add event
      buffer.on('+', function(userObj, fbId){
        var friendData, i, _len, friendsAlready;
        if ( userObj ){
          if ( !this.users ){
            this.users = []
          }
          friendsAlready = false;
          for(i=0,_len=req.user.friends.length;i<_len;i++){
            if ( req.user.friends[i].toString() === userObj.id ){
              friendsAlready = 1;
            }
          }
          if (!friendsAlready){
            friendData = {
                name: userObj.name
              , id: userObj.id
              , fbId: fbId
            };
            this.users.push(friendData);
          }
        }
        if ( --this.count === 0){
          res.json(this.users);
        }
      })
    }else{
      res.json({error:'No Facebook token exists for user'});
    }
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
      users = users.map(function(u){return {id:u.id, name:u.name, email:((u.email&&u.email.replace(/@.+/gi,''))||''), avatar:u.avatar(30)}})
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
        if ( !user.canEmailFriendRequests || !friend.email ){
          return;
        }
        mandrill.messages_send_template({
            template_name:'friend_invite'
          , template_content:''
          , message:{
              subject: 'CourseShark Friends'
            , from_email: 'friends@courseshark.com'
            , from_name: 'CourseShark Friends'
            , track_opens: true
            , track_clicks: true
            , auto_txt: true
            , to: [{name: friend.name, email: friend.email}]
            , template_content: []
            , global_merge_vars:[
                {name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
              , {name: 'SUBJECT', content: 'Friend Invite'}]
            , merge_vars:[{
                rcpt: friend.email
              , vars:[
                  {name: 'FNAME', content: user.firstName}
                , {name: 'SENDER', content: friend.name}
              ]}]
            , tags: ['friends', 'invite']
            }
          }, function (data){
            if ( data.status == 'error' ){
              console.log('ERROR: friend-email-send',data)
            }
        })
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