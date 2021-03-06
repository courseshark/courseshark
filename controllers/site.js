/*
 * Static site pages, including the main page and about pages
 */
exports = module.exports = function(app){
  // Home
  app.get('/', function(req, res){
    if ( require('../lib/flipflop').test('canSeeNewScheduler', req) ){
      res.redirect('/s/home');
    }else{
      res.render('index');
    }
  })

  app.get('/now', requireAdmin, function(req, res){
    res.json(req.online)
  })

  // About pages
  app.get('/about', function(req, res){
    if ( req.headers['x-requested-with'] === 'XMLHttpRequest' ){
      res.render('dialogs/about')
    }else{
      res.render('about/index')
    }
  })

  app.get('/about/terms', function(req, res){
    res.render('about/terms', {});
  })

  app.get('/about/privacy', function(req, res){
    res.render('about/privacy', {});
  })

  app.get('/about/feedback', function(req, res){
    res.render('dialogs/feedback', {});
  })

}
