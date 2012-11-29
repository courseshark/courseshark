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
        friends[i] = friends[i].toObject({virtuals: true})
        friends[i].confirmed=true;
      }
      req.user.getUsersIRequestedToByMyFriend(function(err, friendsUserHasInvited){
        for(var i=0,_len=friendsUserHasInvited.length;i<_len;i++){
          friends.push(friendsUserHasInvited[i].toObject({virtuals:true}))
        }
        res.json(friends||[]);
      })
    })
  })

  app.put('/sandbox/friends/:id', requireLogin, function(req, res){
    for (var i=0,_len=req.user.friends.length;i<_len;i++){
      if (req.user.friends[i].toString() === req.params.id ){
        res.json(true);
        return;
      }
    }
    User.findOne({_id: req.params.id},function(err, friend){
      if ( err||!friend ) { res.json(false); return; }
      User.update({_id: req.user._id}, {$addToSet: {friends: req.params.id}}, function(err, num){
        console.log(arguments);
        if ( err ){ res.json(false); return; }
        res.json(true);
        if ( !friend.canEmailFriendRequests || !friend.email ){
          return;
        }
        require('../lib/friends').sendInviteEmailToFriendFromUser(friend, req.user);
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

}