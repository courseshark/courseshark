/*
 * Recruiter experiment
 */
exports = module.exports = function(app){
  // Home
  app.get('/share-with-recruiters', function(req, res){
    res.render('recruiter/ask');
  })

  app.put('/share-with-recruiters', requireLogin, function(req, res){
    req.user.shareWithRecruiters = ((''+req.body.share)=="true");
    req.user.save(function(err){
      if (err) { console.log('Error saving share-with-recruiters:',err); }
    })
    res.send(200);
  })

  app.get('/recruiter-share-invite', function(req, res){
    res.render('recruiter/dialog');
  })
}
