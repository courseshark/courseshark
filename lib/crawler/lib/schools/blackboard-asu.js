var everySchool = require('./everyschool')
  , EventEmitter = require("events").EventEmitter
  , _ = require('underscore')
  , fs = require('fs')
  , natural = require('natural')
  , path = require('path')

  /**
  * Offers functionality similar to mkdir -p
  *
  * Asynchronous operation. No arguments other than a possible exception
  * are given to the completion callback.
  */
  function mkdir_p(path, mode, callback, position) {
    mode = mode || 777;
    position = position || 0;
    parts = require('path').normalize(path).split('/');
    if (position >= parts.length) {
      if (callback) {
        return callback();
      } else {
        return true;
      }
    }
    var directory = parts.slice(0, position + 1).join('/');
    if (directory === ''){
      return mkdir_p(path, mode, callback, position + 1);
    }
    fs.stat(directory, function(err) {
      if (err === null) {
        return mkdir_p(path, mode, callback, position + 1);
      } else {
        fs.mkdir(directory, mode, function (err) {
          if (err) { console.log('\nError: '+err); return process.exit(); }
          return mkdir_p(path, mode, callback, position + 1);
        })
      }
    })
  }


var blackboardAsu = module.exports = everySchool.submodule('blackboard-asu')

  .howto('skipping')


  .howto('crawl')
    .step('init')
    .step('loadSubjects')
    .step('loadTerms')
    .step('getListing')
    .step('saveSelf')
    .step('storeResults')
    .step('closeDB')



  .howto('cacheCrawl')
    .returns('departments')
    .step('init')
    .step('loadSelf')
    .step('storeResults')


  .howto('save')
    .step('init')
    .step('storeResults')
    .step('closeDB')



  .saveSelf(function(){
    var fs = require('fs')

    process.stdout.write("Saving cache...");
    cacheJSON = {terms: this.terms, departments: this.departments};
    fs.writeFile(this.cache.self, JSON.stringify(cacheJSON), 'utf8', function(){
      process.stdout.write("OK\n");
      next()
    });
  })

  .loadSelf(function(){
    var fs = require('fs')
    process.stdout.write("Loading cache...");
    cacheJSON = JSON.parse(fs.readFileSync(this.cache.self).toString())
    this.terms = cacheJSON.terms
    this.departments = cacheJSON.departments
    process.stdout.write("OK\n");
    next()
  })








  .init(function(term){
    var cacheDir = path.normalize(__dirname + '/../../cache/'+this.abbr)
      , self = this

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Initalizing...");

    mkdir_p(cacheDir, '0777', function(){
      self.cache = {
          directory: cacheDir
        , terms: cacheDir+'/Terms.cache'
        , departments: cacheDir+'/Departments.cache'
        , self: cacheDir+'/Crawled.json'
        , department: function(dep){return cacheDir+'/_'+dep.abbr+'.json'}
      }
      process.stdout.write("OK\n");
      next(term)
    });
  })



  .loadSubjects(function(term){
    var self = this
      , options = {host: self.url, path: self.paths.subjectList, method: 'GET'}
      , cacheFile = self.cache.departments
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Loading departments...");

    parseSubjects = function(err, html){

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
    if( fs.existsSync(cacheFile) ){
      return fs.readFile(cacheFile, 'utf8', function (err, data){parseSubjects(err, data);})
    }else{
      this.dl.download(options, function(err, window, html){
        window.close()
        require('fs').writeFile(cacheFile, html, 'utf8', function (err) {
          if (err) throw err;
          parseSubjects(err, html)
        });
      })
    }
  })













  .loadTerms(function(err, term){
    var self = this
      , options = {host: self.url, path: self.paths.termList, method: 'GET'}
      , cacheFile = self.cache.terms
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Loading terms...");


    callback = function(err, html){

      var regex1 = /t=([0-9]+)">([a-z0-9\s\'\(\)]+)<\/a>/gi
        , regex2 = /t=([0-9]+)">([a-z0-9\s\'\(\)]+)<\/a>/i
        , matches = html.match(regex1)

      if (matches !== undefined){

        for(var _i=0,_len=matches.length; _i<_len; _i++){
          var thisMatch = matches[_i].match(regex2)
          if( thisMatch[1] == term ){
            self.addTerm(thisMatch[1], thisMatch[2])
            process.stdout.write("OK\n");
            _i=_len;
            return next(null, term);
          }
        }

      }

      process.stdout.write('Not OK\n');
      throw new Error("Term "+term+" not found")
      process.exit.write("OK\n");

    }

    // If cache exists use it
    if( fs.existsSync(cacheFile) ){
      return fs.readFile(cacheFile, 'utf8', function (err, data){callback(err, data);})
    }else{
      this.dl.download(options, function(err, window, html){
        window.close();
        require('fs').writeFile(cacheFile, html, 'utf8', function (err) {
          callback(err, html)
          if (err) throw err;
        });
      })
    }

  })





















  .getListing(function(err, term){
    var emitter = new EventEmitter()
      , self = this
      , i = 0
      , year = (self.terms.filter(function(t){return t.number==term})[0]).year
      , parser = function(err, window, html, dep){
          var $ = window.$
            , $sectionRows = $('.grpOdd,.grpOddTitle,.grpEven,.grpEventTitle')
            , sectionsCount = $sectionRows.length

            , done = _.after(sectionsCount, function(){
                window.close()
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write("  Finished " + dep.abbr + " listing\n");
                // Pause for a second before finishing and making the next request
                _.delay(function(){emitter.emit('-')}, 1000)
              })

          _.each($sectionRows, function(row, i){
            var _ref
              , _i
              , $row = $(row)
              , sectionNumber = ($row.find('.classNbrColumnValue').text().match(/([0-9]{5})/)||[0,null])[1]
              , courseRaw = $row.find('.subjectNumberColumnValue').text()
              , courseNumber = (courseRaw.match(/(?:[A-Z]+)\s([0-9]+)/i)||[0,null])[1]
              , sectionType = (courseRaw.match(/\(([A-Z\s]+)\)/i)||[0,null])[1]
              , courseTitle = ($row.find('.titleColumnValue a').text().trim()||'').replace(/\s+/, ' ')
              , hours = ($row.find('.hoursColumnValue').text().trim()||'')
              , datesRaw = ($row.find('.startDateColumnValue a').text().trim()||'')
              , startDate = (datesRaw.match(/([0-9]+\/[0-9]+)\s+\-/)||[0,null])[1]+'/'+year
              , endDate   = (datesRaw.match(/\-\s+([0-9]+\/[0-9]+)/)||[0,null])[1]+'/'+year
              , session = (datesRaw.match(/\(([A-Z])\)/)||[0,null])[1]
              , daySets = ($row.find('.dayListColumnValue').html()||'').replace(/\s+/g,' ').replace('&nbsp;','').trim().split(/<\s*br\s*\/>/).filter(function(e){return e!==''})
              , timeslotCount = daySets.length
              , startTimeSets = ($row.find('.startTimeDateColumnValue').html()||'').replace(/\s+/g,' ').replace(/&nbsp;/g,'').replace(/12:00\s+AM/g,'').trim().split(/<\s*br\s*\/>/).filter(function(e,i,l){return e!==''||l.length>1})
              , endTimeSets = ($row.find('.endTimeDateColumnValue').html()||'').replace(/\s+/g,' ').replace(/&nbsp;/g,'').replace(/12:00\s+AM/g,'').trim().split(/<\s*br\s*\/>/).filter(function(e,i,l){return e!==''||l.length>1})
              , locationHashSet = (_ref=(($row.find('.locationBuildingColumnValue').text()||'').trim().replace(/Internet/g, '\nInternet').replace(/\n+/g, "\n").split(/\n/g))).splice(0,_ref.length-1).filter(function(e,i,l){return e!==''})
              , campusSet = locationHashSet.map(function(loc){return (loc.match(/([a-z]+)\s*\-/i)||[null,null])[1]}).filter(function(c){return c!==null})
              , locationSet = locationHashSet.map(function(loc){return (loc.match(/(?:[a-z]+)\s*\-\s*(.+)/)||[null,null])[1]}).filter(function(c){return c!==null})
              , sectionCategorySet = $row.find('.tooltipRqDesDescrColumnValue').text().trim().split(/,/).filter(function(c){return c!==''})
              , instructor = ($row.find('.instructorListColumnValue a').attr('title')||'').replace(/Instructor\|/i, '')||(($row.find('.instructorListColumnValue').text()).match(/(staff)/i)||[0,null])[1]
              , seatsInfo = ($row.find('.availableSeatsColumnValue').text()||'').trim().match(/([0-9]+)\s*(?:of)\s*([0-9]+)/) || [0,0,0]
              , seatsAvailable = seatsInfo[1]
              , seatsTotal = seatsInfo[2]


              , course = dep.findOrAddCourseByNumber(courseNumber)
              , section = course.addSectionFromNumber(sectionNumber)

              , dayMap = {'M':'monday', 'T':'tuesday','W':'wednesday','TH':'thursday','F':'friday','SA':'saturday','U':'sunday','O':'online'}

            course.title = course.title || courseTitle

            section.type = sectionType
            section.credits = hours

            section.categorySet = sectionCategorySet
            section.session = session
            section.instructor = instructor
            section.campusSet = campusSet
            section.seatsAvailable = seatsAvailable
            section.seatsTotal = seatsTotal

            for(_i=0; _i<timeslotCount; _i++){
              timeslot = section.newTimeslot()
              timeslot.days = (daySets[_i]||'').trim().split(/\s/).map(function(d){ return dayMap[d.toUpperCase()] })
              timeslot.setStartDate(startDate)
              timeslot.setEndDate(endDate)
              timeslot.setStartTime(startTimeSets[_i]||null)
              timeslot.setEndTime(endTimeSets[_i]||null)
              timeslot.location = {campus: campusSet[_i]||campusSet[0], location: locationSet[_i]||locationSet[0]}
              section.timeslots.push(timeslot)
            }
            done();
          })
        }
      , download = function(){
          var dep = self.departments[i++]
            , cacheFile = self.cache.department(dep)
          if ( dep.abbr != "CSE" ){
            return emitter.emit('-')
          }

          process.stdout.write("\n  Downloading " + dep.abbr + " listing...");

          // If cache exists use it
          if( fs.existsSync(cacheFile) ){
            return fs.readFile(cacheFile, 'utf8', function (err, data) {
              var jsdom = require('jsdom')
                , jq = fs.readFileSync(__dirname + '/../blackboard-asu/jquery.min.js').toString()
              if ( err ){ throw err; }
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write("  Recieved " + dep.abbr + " listing from cache");
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
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write("  Recieved " + dep.abbr + " listing");
              // Download of section
              require('fs').writeFile(cacheFile, html, 'utf8', function (err) {
                if (err) throw err;
                (function(err, window, html, dep){
                  return parser(err, window, html, dep)
                })(err, window, html, dep)
              });
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
    process.stdout.write("Storing results...\n");
    var self = this
      , totalEmitter = new EventEmitter()
      , tasksLeft = 0
      , done = function(){
          process.stdout.write("OK!\n");
          next()
        }
      // School vars
      , selfSchool = {
            name: self.name
          , abbr: self.abbr
          , state: self.state
          , city: self.city
          , zip: self.zip
        }
      , schoolSearch = {abbr: self.abbr}
      , schoolUpsertData = (new School(selfSchool)).toObject()
      // Store term
      , storeTerm = function(dbSchool){
          process.stdout.write('\tStoring Term... ')
          var objTerm = self.terms[0]
            , search = {
                  number: objTerm['number']
                , school: dbSchool['_id']
              }
            , upsertData = (new Term(search)).toObject();

          delete(upsertData._id);
          delete(upsertData.active);

          upsertData.season = objTerm.season
          upsertData.year = objTerm.year
          upsertData.name = objTerm.season + ' ' +objTerm.year

          Term.update(search, upsertData, {upsert: true}, function(err, num){
            Term.findOne(search, function(err, dbTerm){
              dbSchool.addTerm(dbTerm)
              process.stdout.write('OK\n')
              storeDepartments(dbSchool, dbTerm);
            })
          })
        }
      // Store departments
      , storeDepartments = function(dbSchool, dbTerm){
          var depEmitter = new EventEmitter()
            , depCount = 0
          process.stdout.write('\tStoring Data ...')
          totalEmitter.emit('+')
          depEmitter.on('-', function(){
            if ( --depCount === 0 ){
              process.stdout.write('OK\n')
              totalEmitter.emit('-')
            }
          })

          for ( var d in self.departments ){
            depCount++
            if ( !self.departments.hasOwnProperty(d) ){continue;}
            objDep = self.departments[d]
            var search = {
                    name: objDep['text']
                  , abbr: objDep['abbr']
                  , school: dbSchool['_id']
                }
              , department = new Department(search)
              , upsertData = department.toObject();
            upsertData._tokens = natural.PorterStemmer.tokenizeAndStem(upsertData.abbr + " " + upsertData.name);
            delete(upsertData._id);
            Department.update(search, upsertData, {upsert: true}, (function(dbSchool, dbTerm, objDep, search){
              return function(err, numAffected){
                Department.findOne(search, function(err, dbDep){
                  storeCourses(dbSchool, dbTerm, objDep, dbDep);
                  depEmitter.emit('-')
                })
              }})(dbSchool, dbTerm, objDep, search)
            )
          }
        }

      // Store Courses
      , storeCourses = function(dbSchool, dbTerm, objDep, dbDep){
          totalEmitter.emit('+')
          var courseEmitter = new EventEmitter()
            , courseCount = 0
            , objCourse
            , search
            , upsertData
          _.each(objDep.courses, function(c){
            if ( !objDep.courses.hasOwnProperty(c) ){return;}
            courseCount++;
            objCourse = objDep.courses[c];
            search = {
                name: objCourse['title']
              , department: dbDep['_id']
              , number: objCourse['number']
            }
            course = new Course(search)
            upsertData = course.toObject();

            delete(upsertData._id);
            delete(upsertData.terms);

            upsertData.school = dbSchool['_id']
            upsertData.departmentAbbr = dbDep.abbr

            if( typeof objCourse['description'] !== undefined ){
              upsertData.description = objCourse['description'] || ''
              upsertData._tokens = natural.PorterStemmer.tokenizeAndStem([course.department.abbr,course.number,course.name,course.description].join(' ').trim())
            }else{
              upsertData._tokens = natural.PorterStemmer.tokenizeAndStem([course.department.abbr,course.number,course.name].join(' ').trim())
            }

            Course.update(search, {$set:upsertData,$addToSet:{terms:dbTerm._id}}, {upsert: true}, (function(dbTerm, objCourse, search){
              return function(err, numAffected){
                if ( err ){ throw err }
                Course.findOne(search, function(err, dbCourse){
                  if ( err ){ throw err }
                  storeSections(dbSchool, dbTerm, objCourse, dbCourse, dbDep);
                  courseEmitter.emit('decreaseCount');
                })
              }})(dbTerm, objCourse, search)
            )
          })
          if ( courseCount === 0 ){
            totalEmitter.emit('-')
          }
          courseEmitter.on('decreaseCount', function(){
            if ( --courseCount === 0 ){
              totalEmitter.emit('-')
            }
          })
        }

      // Store sections
      , storeSections = function(dbSchool, dbTerm, objCourse, dbCourse, dbDep){
          totalEmitter.emit('+')
          var secEmitter = new EventEmitter()
            , secCount = 0
            , objSection
            , search
            , upsertData
            , s
          for ( s in objCourse.sections ){
            if ( !objCourse.sections.hasOwnProperty(s) ){continue;}
            secCount++
            objSection = objCourse.sections[s]
            upsertData = (new Section({
                cid: [  dbSchool['abbr']
                      , dbTerm['number']
                      , dbDep['abbr']
                      , dbCourse['number']
                      , objSection['number']].join('-').toLowerCase()
              , number: objSection.number
              , info: objSection.sectionId
              , course: dbCourse['_id']
              , department: dbDep['_id']
              , term: dbTerm['_id']
              , credits: objSection.credits
            })).toObject();

            delete(upsertData._id);
            delete(upsertData.credits);
            delete(upsertData.name);

            upsertData.school = dbSchool['_id']
            upsertData.name = dbDep.abbr + ' ' + dbCourse.number + ' #' + upsertData.number
            upsertData.instructor = objSection['instructor']
            upsertData.categorySet = objSection['categorySet']
            upsertData.session = objSection['session']
            upsertData.campusSet = objSection['campusSet']

            if ( typeof objSection['seatsTotal'] !== undefined ){
              upsertData.seatsTotal=objSection['seatsTotal']
            }
            if ( typeof objSection['seatsAvailable'] !== undefined ){
              upsertData.seatsAvailable = objSection['seatsAvailable']
            }
            if( objSection['description'] !== undefined ){
              upsertData.description = objSection['description']
              upsertData._tokens = natural.PorterStemmer.tokenizeAndStem([upsertData.instructor,upsertData.description,upsertData.number].join(' ').trim())
            }else{
              upsertData._tokens = natural.PorterStemmer.tokenizeAndStem([upsertData.instructor,upsertData.number].join(' ').trim())
            }

            upsertData.timeslots = []
            for ( _i=0,_len=objSection.timeslots.length; _i<_len; _i++ ){
              //console.log(objSection.timeslots[_i].days)
              timeslot = new Timeslot(objSection.timeslots[_i])
              upsertData.timeslots.push(timeslot)
            }


            // Deleted course from upsert since we cant update the course
            /// Supposedly it will be added b/c it is in the search and upserts combine?
            delete upsertData.course;
            Section.update({cid: upsertData.cid}, upsertData, {upsert: true}, (function(dbTerm, objSection, search){
              return function(err, num){
                if ( err ){
                  //console.log("-- Error --",err,objSection,search);
                  return secEmitter.emit('decreaseCount')
                }
                Section.findOne(search, function(err, dbSection){
                  if ( err || !dbSection ){ console.log(err, objSection, search, dbSection); }
                  dbCourse.addSection(dbSection)
                  secEmitter.emit('decreaseCount')
                });
              }})(dbTerm, objSection, {cid: upsertData.cid})
            )
          }
          secEmitter.on('decreaseCount', function(){
            if ( --secCount === 0 ){
              totalEmitter.emit('-')
            }
          })
        }




    //totalEmitter setup
    totalEmitter.on('+', function(){
      tasksLeft++
    })
    totalEmitter.on('-', function(){
      if ( --tasksLeft === 0 ){ done(); }
    })

    // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
    ;
    delete schoolUpsertData._id;
    delete schoolUpsertData.enabled;
    School.update(schoolSearch, schoolUpsertData, {upsert: true}, function(err, num){
      // Find the school we just saved for future reference
      School.findOne(schoolSearch, function(err, dbSchool){ if(err){next(err)}else{storeTerm(dbSchool);} })
    }); // end update
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
