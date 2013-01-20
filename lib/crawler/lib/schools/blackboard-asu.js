var everySchool = require('./everyschool')
  , EventEmitter = require("events").EventEmitter
  , _ = require('underscore')
  , fs = require('fs')

var blackboardAsu = module.exports = everySchool.submodule('blackboard-asu')

  .howto('skipping')


  .howto('crawl')
    .step('loadSubjects')
    .step('loadTerms')
    .step('getListing')

  .howto('notImplemented')
    .step('saveSelf')
    .step('storeResults')


  .howto('cacheCrawl')
    .returns('departments')
    .step('loadSelf')
    .step('storeResults')


  .howto('save')
    .step('storeResults')
    .step('closeDB')



  .saveSelf(function(){
    var fs = require('fs')

    process.stdout.write("Saving cache...");
    cacheJSON = {terms: this.terms, departments: this.departments};
    fs.open(__dirname + '/../../cache/'+this.abbr+'.cache', 'w', function(err, fd){
      process.stdout.write("OK\n");
      fs.write(fd, JSON.stringify(cacheJSON));
    })
    next()
  })

  .loadSelf(function(){
    var fs = require('fs')
    process.stdout.write("Loading cache...");
    cacheJSON = JSON.parse(fs.readFileSync(__dirname + '/../../cache/'+this.abbr+'.cache').toString())
    this.terms = cacheJSON.terms
    this.departments = cacheJSON.departments
    process.stdout.write("OK\n");
    next()
  })












  .loadSubjects(function(term){
    var self = this
      , options = {host: self.url, path: self.paths.subjectList, method: 'GET'}
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Loading departments...");

    callback = function(err, window, html){
      window.close();

      var regex1 = /<div class="subject">([A-Z]{2,4})<\/div><div class="subjectTitle">([a-z0-9\s\-\_\{\}\(\)]+)<\/div>/gi
        , regex2 = /<div class="subject">([A-Z]{2,4})<\/div><div class="subjectTitle">([a-z0-9\s\-\_\{\}\(\)]+)<\/div>/i
        , matches = html.match(regex1)

      if ( matches === undefined ){
        process.stdout.write('Not OK');
        next(new Error('No Subjects found'), null)
      }

      for(var _i=0,_len=matches.length; _i<_len; _i++){
        var thisMatch = matches[_i].match(regex2)
        self.addDepartment(thisMatch[1], thisMatch[2])
      }
      process.stdout.write("OK\n");
      next(null, term)
    }

    if( fs.existsSync('Departments.cache') ){
      return fs.readFile('Departments.cache', 'utf8', function (err, data){callback(err, {close: function(){}}, data);})
    }else{
      this.dl.download(options, function(err, window, html){
        callback(err, window, html)
        require('fs').writeFile('Departments.cache', html, 'utf8', function (err) {
          if (err) throw err;
        });
      })
    }
  })













  .loadTerms(function(err, term){
    var self = this
      , options = {host: self.url, path: self.paths.termList, method: 'GET'}
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Loading terms...");


    callback = function(err, window, html){
      window.close();

      var regex1 = /t=([0-9]+)">([a-z0-9\s\'\(\)]+)<\/a>/gi
        , regex2 = /t=([0-9]+)">([a-z0-9\s\'\(\)]+)<\/a>/i
        , matches = html.match(regex1)

      if ( matches === undefined ){
        process.stdout.write('Not OK');
        next(new Error('No Terms found'))
      }

      for(var _i=0,_len=matches.length; _i<_len; _i++){
        var thisMatch = matches[_i].match(regex2)
        if( thisMatch[1] == term ){
          self.addTerm(thisMatch[1], thisMatch[2])
          process.stdout.write("OK\n");
          _i=_len;
          return next(null, term);
        }
      }
      next(new Error("Term "+term+" not found"), null)
    }

    // If cache exists use it
    if( fs.existsSync('Terms.cache') ){
      return fs.readFile('Terms.cache', 'utf8', function (err, data){callback(err, {close: function(){}}, data);})
    }else{
      this.dl.download(options, function(err, window, html){
        callback(err, window, html)
        require('fs').writeFile('Terms.cache', html, 'utf8', function (err) {
          if (err) throw err;
        });
      })
    }

  })





















  .getListing(function(err, term){
    var emitter = new EventEmitter()
      , self = this
      , i = 0
      , parser = function(err, window, html, dep){
          var $ = window.$
            , $sectionRows = $('.grpOdd,.grpOddTitle,.grpEven,.grpEventTitle')
            , sectionsCount = $sectionRows.length
          console.log("Found",sectionsCount, "classes for", dep.abbr)


          _.each($sectionRows, function(row){
            var $row = $(row)
          })


          // Pause for a second before finishing and making the next request
          _.delay(function(){emitter.emit('-')}, 1000)
        }
      , download = function(){
          var dep = self.departments[i++]
          if ( dep.abbr != "CSE" ){
            return emitter.emit('-')
          }
          // If cache exists use it
          if( fs.existsSync('CSE.cache') ){
            return fs.readFile('CSE.cache', 'utf8', function (err, data) {
              var jsdom = require('jsdom')
                , jq = fs.readFileSync(__dirname + '/../blackboard-asu/jquery-1.7.min.js').toString()
              if ( err ){ return parser(err, null, data, dep); }
              jsdom.env({ html: data, src: [jq], done: function(err, window){
                (function(err, window, data, dep){
                  return parser(err, window, data, dep)
                })(err, window, data, dep)
              }})
            })
          }
          // Only download if file doesn't exist
          self.dl.download({
                host: self.url
              , path: self.paths.listing
              , method: 'GET'
              , headers: {cookie: 'onlineCampusSelection=C'}
              , data: {
                    s: dep.abbr
                  , t: term
                  , e: 'all'
                  , hon: 'F'
                }
              , referer: 'https://'+self.url+'/catalog/'
            }, function(err, window, html){
              // Download of section
              require('fs').writeFile('CSE.cache', html, 'utf8', function (err) {
                if (err) throw err;
              });
              (function(err, window, html, dep){
                return parser(err, window, html, dep)
              })(err, window, html, dep)
          }) // End download of listing
        } // End download function


    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Loading listings...");

    emitter.i = self.departments.length - 1;

    emitter.on('-', function(){
      if(--this.i<=0){
        process.stdout.write("OK\n");
        return next(null, term)
      }
      download()
    })

    download();

  })





















  .storeResults(function(termUpdating){
    this.structures.storeSchool(this, next)
  })

  .configurable('closeDB')
  .closeDB(function(){
    this.mongoose.disconnect()
    next()
  })




  .configurable('updateSection')
  .updateSection(function(section, callback){
    var self = this
    Term.findOne({_id: section.term}).exec(function(e, term){
      downloadHelper(section, term, callback);
    })

    downloadHelper = function(section, term, callback){
      var data = {
              term_in: ''+term.number
            , crn_in: ''+section.number
          }
        , options = {host: self.url, path: self.paths.details, method: 'GET', data: data}
      self.dl.download(options, function(window, html){
        var $ = window.$, update = {}, $numbers;

        $numbers = $('.dddefault').filter(function(){return (/^[0-9\-]+$/).test($(this).text())})
        update.seatsTotal = parseInt($numbers.eq(0).text(), 10)
        section.seatsTotal = update.seatsTotal
        update.seatsAvailable = parseInt($numbers.eq(2).text(),10)
        section.seatsAvailable = update.seatsAvailable;

        if ( $numbers.length === 6 ){
          update.waitSeatsTotal = parseInt($numbers.eq(3).text(), 10)
          section.waitSeatsTotal = update.waitSeatsTotal

          update.waitSeatsAvailable = waitRemain = parseInt($numbers.eq(5).text(),10)
          section.waitSeatsAvailable = update.waitSeatsAvailable;
        }
        update.updated = new Date()
        Section.update({_id: section._id, course: section.course, term: term.id}, {$set: update }).exec(function(err){
          callback(err, section, update);
          window.close();
        })
      })
    }
  })

  .configurable('safeUpdateSection')
  .safeUpdateSection(function(section, expires, callback){
    var updated = new Date(section.updated).getTime()
      , now = (new Date()).getTime()
    if ( updated + expires < now || !section.seatsAvailable ){
      this.updateSection(section, callback)
    }else{
      callback(undefined, section)
    }
  })
