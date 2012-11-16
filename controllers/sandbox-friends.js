/*
 * User management site pages
 */
exports = module.exports = function(app){
  // home
  app.get('/sandbox/friends', requireSchool, function(req, res){
    var friends = []
      , invites = []
      , invited = []
    User.findById('4ffd366d2819105a12000003', function(err,user){
      Section.find({_id: {$in: [
          '50803ef5b0ad06a16235c7dd',
          '50803ef7b0ad06a16235cd35',
          '50803effb0ad06a16235e29b',
          '50803ebac9d14226d11634bf'
        ]}}, function(err, sections){
        user = new User()
        user.set('firstName', 'Lee');
        user.set('lastName', 'Adama');
        user.set('email', 'lee.adama@courseshark.com');
        schedule = new Schedule({
          term: req.school.term,
          name: "My schedule",
          primary: true,
          sections: sections
        })
        user.set('schedule', schedule)
        friends.push(user);
        friends.push(new User({firstName: 'Jane', lastName: 'Seymour', school: req.school}))
        res.json(friends)
      })
    });
  })

  app.put('/sandbox/friends/:id', requireSchool, function(req, res){
    console.log('[friends] ADD : ',req.body)
  })

  app.delete('/sandbox/friends/:id', requireSchool, function(req, res){
    console.log('[friends] Remove : ',req.body)
  })

}