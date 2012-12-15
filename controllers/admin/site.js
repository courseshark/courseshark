/*
 * Admin controller
 */
var EventEmitter = require("events").EventEmitter
  , seatWatcher = require('../../lib/seat-watcher')

exports = module.exports = function(app){
  // Admin dashboard
  app.get('/', function(req, res){
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
}