var everySchool = require('./everyschool')

var banner = module.exports = everySchool.submodule('banner')

  .howto('crawl')
    .returns('departments')
    .step('loadTerms')
      .accepts('term')
    .step('loadDepartments')
      .accepts('terms')
    .step('listSections')
      .accepts('term')
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
    cacheJSON = {terms: this.terms, departments: this.departments}
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



  .loadTerms(function(termUpdating){
    var self = this
    options = {host: self.url, path: self.paths.termList}
    process.stdout.write("Loading term listing...");
    self.download(options, function(window, html){
      var $ = window.$
      $('SELECT OPTION').each(function() {
        $this = $(this)
        if ( $this.val() ){
          termNames = $this.text().replace(/\s*\([^\)]+\)/, '').split(/\n/g)
          termName = termNames[0]
          termNumber = parseInt($this.val(), 10)
          if ( termNumber == termUpdating ){
            self.addTerm(termNumber, termName)
          }
        }
      })
      window.close()
      process.stdout.write("OK\n");
      next(termUpdating)
    })
  })
  .loadDepartments(function(termUpdating){
    var self = this
      , data = {p_calling_proc: "bwckschd.p_disp_dyn_sched", p_term: termUpdating}
      , options = {host: self.url, path: self.paths.term, method: 'POST', data: data}
    process.stdout.write("Loading departments for term...");
    this.dl.download(options, function(window, html){
      var $ = window.$
      $('SELECT[name="sel_subj"] OPTION').each(function(){
        $this = $(this)
        abbr = $this.val()
        text = $this.text().replace(/\n.*/g, '')
        self.addDepartment(abbr, text)
      })
      window.close()
      process.stdout.write("OK\n");
      next(termUpdating)
    })
  })
  .listSections(function(termUpdating){
    var self = this
      , EventEmitter = require("events").EventEmitter
      , emitter = new EventEmitter()
      , depAt = 0

      function sleep(milliSeconds) {
        var startTime = new Date().getTime();
        while (new Date().getTime() < startTime + milliSeconds);
      }

    self.loadDepartmentSectionsCount++;
    function downloadLoop(d,deps){
      if ( d >= deps.length ){
        self.loadDepartmentSectionsCount--
        emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
        return
      }
      dep = deps[d]
      self.loadDepartmentSections(termUpdating, dep, emitter)
    }

    downloadLoop(depAt, self.departments)

    emitter.on('doneLoadingDept', function(numLeft){
      if (numLeft === 0){
        next(termUpdating);
      }else{
        downloadLoop(++depAt, self.departments)
      }
    })
  })

  .storeResults(function(termUpdating){
    this.structures.storeSchool(this, next)
  })

  .configurable('closeDB')
  .closeDB(function(){
    this.mongoose.disconnect()
    next()
  })





  .configurable('loadDepartmentSectionsCount')
  .loadDepartmentSectionsCount(0)
  .configurable('loadDepartmentSections')
  .loadDepartmentSections(function(termUpdating, department, emitter){
    var self = this
      , data = !self.config.dummy?{
            term_in: termUpdating
          , sel_subj: ["", department.abbr]
          , sel_day: ""
          , sel_schd: ""
          , sel_insm: ""
          , sel_camp: ["", "%"]
          , sel_levl: ""
          , sel_sess: ""
          , sel_instr: ["", "%"]
          , sel_ptrm: ["", "%"]
          , sel_attr: ["", "%"]

          , sel_crse: ""
          , sel_title: ""

          , sel_from_cred: ""
          , sel_to_cred: ""

          , begin_hh: "0"
          , begin_mi: "0"
          , begin_ap: "a"

          , end_hh: "0"
          , end_mi: "0"
          , end_ap: "a"
        }:{
            term_in: termUpdating
          , sel_subj: ["dummy", department.abbr]
          , sel_day: "dummy"
          , sel_schd: ["dummy", "%"]
          , sel_insm: ["dummy", "%"]
          , sel_camp: ["dummy", "%"]
          , sel_levl: ["dummy", "%"]
          , sel_sess: "dummy"
          , sel_instr: ["dummy", "%"]
          , sel_ptrm: ["dummy", "%"]
          , sel_attr: ["dummy", "%"]
          , sel_crse: ""
          , sel_title: ""
          , sel_from_cred: ""
          , sel_to_cred: ""
          , begin_hh: "0"
          , begin_mi: "0"
          , begin_ap: "a"
          , end_hh: "0"
          , end_mi: "0"
          , end_ap: "a"
        }
      , options = {host: self.url, path: self.paths.listing, method: 'POST', data: data}

    self.loadDepartmentSectionsCount++

    process.stdout.write("  Downloading " + department.abbr + " listing...");


    self.dl.download(options, function(window, html){
      var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList

      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("  Recieved " + department.abbr + " listing");

      $table = $('table.datadisplaytable[summary="This layout table is used to present the sections found"]')
      $sections = $table.find('.ddtitle')
      if ( $sections.length ){
        var EventEmitter = require("events").EventEmitter
          , sectionsAllEmitter = new EventEmitter()

        sectionsAllEmitter.count = $sections.length;

        sectionsAllEmitter.on('doneSection', function(){
          if (--this.count <= 0){
            window.close();
            self.loadDepartmentSectionsCount--;

            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("Finished " + department.abbr + " .. OK\n");

            emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount);
          }
        })

        $sections.each(function(){
          $sectionHead = $(this)
          $sectionDetailsContainer = $sectionHead.parent().next()
          $sectionDetails = $sectionDetailsContainer.find('table.datadisplaytable')
          $sectionDetailsList = $sectionDetails.find('.dddefault')

          title = $sectionHead.children('a').text()
          details = []; $sectionDetailsList.each(function(i,o){details.push($(o).text())})
          credits = $sectionDetailsContainer.html().match(/([\.\d]+)\s(?:TO\s+([\.\d]+)\s+)?Credits/i)
          if ( credits ){
            if ( credits[2] !== undefined ){
              credits = ''+parseInt(credits[1],10)+'-'+parseInt(credits[2],10)
            }else{
              credits = ''+parseInt(credits[1],10)
            }
          }else{
            //console.log($sectionDetailsContainer.text(), credits);
            credits = 3
          }

          var c = department.findOrAddCourseBySectionTitle(title);


          // Set the course descroption
          (function(termUpdating, department, c, title, details, credits){
            self.getCourseDescription(termUpdating, department, c, function(description){

              c.description = description;
              section = c.addSectionFromInfo(title, details, credits)
              department.courses[''+c] = c
              section.info = title.match(/[0-9a-z]+$/gi)[0]

              specialDescription = $sectionDetailsContainer.html().match(/Long\s+Title:\s*<\/span>\s*([^\n]+?)\s?\n/i)
              if ( specialDescription ){
                section.description = specialDescription[1]
              }
              section.instructor = (section.timeslots[0]?section.timeslots[0].instructor:'').replace(/\s+/g,' ').trim()

              sectionsAllEmitter.emit('doneSection')
            })
          })(termUpdating, department, c, title, details, credits)
        })
      }else{
        console.log('--not-section--',$table.text(), options)
        window.close()
        self.loadDepartmentSectionsCount--

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("  Finished " + department.abbr + " .. No Sections\n");

        emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
      }
    })
  })

  .configurable('getCourseDescription')
  .getCourseDescription(function(termUpdating, department, course, callback){
    // Return if we already have a description or dont have a courseInfo path
    if (course.description||!this.paths.courseInfo){
      return callback(course.description)
    }
    course.description = true;
    var self = this
      , data = !self.config.dummy?{
            term_in: termUpdating
          , one_subj: department.abbr
          , sel_crse_strt: course.number
          , sel_crse_end: course.number
          , sel_subj: ""
          , sel_levl: ""
          , sel_schd: ""
          , sel_coll: ""
          , sel_divs: ""
          , sel_dept: ""
          , sel_attr: ""
        }:{
            term_in: termUpdating
          , one_subj: department.abbr
          , sel_crse_strt: course.number
          , sel_crse_end: course.number
          , sel_subj: "dummy"
          , sel_levl: "dummy"
          , sel_schd: "dummy"
          , sel_coll: "dummy"
          , sel_divs: "dummy"
          , sel_dept: "dummy"
          , sel_attr: "dummy"
        }
      , options = {host: self.url, path: self.paths.courseInfo, method: 'GET', data: data}
    // Download the page
    self.dl.download(options, function(window, html){
      var $ = window.$
      // Find the first .ntdefault (<tr> tag with info we need)
      // Get its HTML
      // Replace new lines with spaces
      // Break on <br> tag
      // Trim it up
      description = ($('.ntdefault').eq(0).html()||"").replace(/[\n\r]/gi, ' ').split(/<br\s*\/?\s*>/)[0].trim()
      window.close();
      callback(description);
    })

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
