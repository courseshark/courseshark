varexpress = require('express');

exports.boot = function(app) {
  app.use(function(req, res, next){
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
      res.render('errors/index', { url: req.url, status: 404, title: "Missing", error: "It seems that page is gone." });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
  });
};

