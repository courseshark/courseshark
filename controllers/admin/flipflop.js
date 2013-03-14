/*
 * Admin controller
 */
var EventEmitter = require("events").EventEmitter
  , seatWatcher = require('../../lib/flipflop')

exports = module.exports = function(app){
  app.get('/features', function(req, res){
    FlipFlop.find({'deleted': {$exists: false}}).populate('created_by').exec(function(err, flipflops){
      res.render('admin/features/index', {flipflops: flipflops, layout: 'admin/layout'})
    })
  })
  app.get('/features/:name', function(req, res){
    FlipFlop.findOne({name: req.params.name}).populate('created_by').exec(function(err, flipflop){
      res.render('admin/features/edit', {flipflop: flipflop, layout: 'admin/layout'})
    })
  })
}