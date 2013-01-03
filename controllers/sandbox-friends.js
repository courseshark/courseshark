var cleanUserObject = require('../lib/user').cleanUserObject
/*
 * User management site pages
 */
exports = module.exports = function(app){
  // home
  app.get('/sandbox/friends', requireLogin, function(req, res){
    var friends = []
      , invites = []
      , invited = []
    req.user.getFriends(function(err, friends){
      for(var i=0,_len=friends.length;i<_len;i++){
        friends[i] = cleanUserObject(friends[i].toObject({virtuals: true}))
        friends[i].confirmed=true;
      }
      req.user.getUsersIRequestedToByMyFriend(function(err, friendsUserHasInvited){
        for(var i=0,_len=friendsUserHasInvited.length;i<_len;i++){
          friends.push(cleanUserObject(friendsUserHasInvited[i].toObject({virtuals:true})))
        }
        res.json(friends||[]);
      })
    })
  })

  app.get('/sandbox/friends/invites', requireLogin, function(req, res){
    req.user.getFriendRequests(function(err, invites){
      if ( err ){
        res.json({error: err})
      }else{
        res.json(invites.map(function(f){return cleanUserObject(f.toObject());}))
      }
    })
  })

  app.put('/sandbox/friends/:id', requireLogin, function(req, res){
    User.findOne({_id: req.params.id},function(err, friend){
      if ( err||!friend ) { res.json(false); return; }
      User.update({_id: req.user._id}, {$addToSet: {friends: req.params.id}}, function(err, num){
        if ( err ){ res.json(false); return; }

        var friendClean = cleanUserObject(friend.toObject())
        // Check if already friends
        for (var i=0,_len=friend.friends.length;i<_len;i++){
          if (friend.friends[i].toString() == req.user.id){
            friendClean.confirmed=true;
          }
        }
        res.json(friendClean);
        if ( friend.canEmailFriendRequests && friend.email && !friendClean.confirmend){
          require('../lib/friends').sendInviteEmailToFriendFromUser(friend, req.user);
        }
      })
    })
  })

  app.delete('/sandbox/friends/:id', requireLogin, function(req, res){
    var friendId = req.params.id.toString().replace(/[^0-9a-z]/ig, '')
    User.update({_id: req.user.id}, {$pull:{friends:friendId}}, function(err, num){
      User.update({_id: friendId}, {$pull:{friends:req.user._id}}, function(err,num){
        res.json(true)
      })
    })
  })



  // Search API

  app.get('/sandbox/friends/search/:name', function(req, res){
    var query, re;
    if (!req.loggedIn){return res.json({query: query, error: 'not logged in'});}

    // Turn the query into a regular expression
    query = req.params.name.replace(/[^a-z0-9\s@]/gi, '').replace(/\\/, '\\').replace(/[^\\]\./,'\\.')
    if ( query.length < 3 ){res.json({query: query, users:[]});}

    req.user.getFriends(function(err, friends){
      var alreadyFriends = friends.map(function(f){return f.id})
      if (query.indexOf(' ') !== -1){
        re = new RegExp(query.replace(/\s/, '|'), 'gi')
        search = {  school: req.user.school
                  , $and:[
                        {firstName:re}
                      , {lastName:re}
                    ]
                  , _id: {$nin: alreadyFriends}
                }
      }else{
        re = new RegExp(query.replace(/\s/, '|'), 'gi')
        search = {  school: req.user.school
                  , $or:[
                        {firstName:re}
                      , {lastName:re}
                      , {email:re}
                    ]
                  , _id: {$nin: alreadyFriends}
                }
      }
      // Find the users who arnt friends, at the school, and match the regex
      User.find(search, function(err, users){
        if (users){
          users = users.map(function(u){return {_id:u.id, name:u.name, email:((u.email&&u.email.replace(/@.+/gi,''))||''), avatar:u.avatar}})
          return res.json({query: query, users: users})
        }
        res.json({query: query, users: [], error: err})
      })
    })
  })


}