/*
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
var flipflop = require('../lib/flipflop');

exports = module.exports = function(app){
  var seats = app.io.of('/seats')
    , crawler = require('../lib/crawler')

  seats.on('connection', function (socket) {
    socket.on('update', function(sectionId){
      var FIFTEEN_MINUTES = 1000 * 60 * 15
      Section.findById(sectionId).exec(function(err, section){
        Term.findById(section.term).populate('school').exec(function(err, term){
          if ( term.active ){
            crawler[term.school.abbr].safeUpdateSection(section, FIFTEEN_MINUTES, function(err, section){
              socket.emit('result', {
                    id: section.id
                  , seatsAvailable: section.seatsAvailable
                  , seatsTotal: section.seatsTotal
                  , waitSeatsAvailable: section.waitSeatsAvailable
                  , waitSeatsTotal: section.waitSeatsTotal
              })
            })
          }else{
            var avail = section.seatsAvailable?section.seatsAvailable:'-'
              , tot = section.seatsTotal?section.seatsTotal:'?';
              socket.emit('result', {
                    id: section.id
                  , seatsAvailable: section.seatsAvailable
                  , seatsTotal: section.seatsTotal
                  , waitSeatsAvailable: section.waitSeatsAvailable
                  , waitSeatsTotal: section.waitSeatsTotal
              })
          }
        })
      })
    })
  })

}