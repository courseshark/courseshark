/*
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
exports = module.exports = function(app){

  var seats = app.io.of('/seats')
    , crawler = require('../lib/crawler')
  /**
  *
  * Main Views
  *
  **/

  app.get('/schedule', requireSchool, function(req, res){
    res.redirect('/s/');
  })

  app.get('/s(/*)?', requireSchool, function(req, res){
    req.session.redirectTo='/s/';
    School.findById(req.school.id, {
        terms:0
      , oldId:0
      , city:0
      , state:0
      , zip:0
      , waitlist:0
      , enabled:0
      , notificationCron:0
      , notifications:0
      , created:0
      , modified:0
      }, function(err, school){
          Term.find({school: req.school}, {
            school:0
            }, function(err, terms){
                res.render('schedule/schedule', {school: school, terms: terms, layout: 'app-layout.ejs', built: app.settings.env!="development"});
          })
    })
  })

  app.get('/launch-schedule', requireSchool, function(req, res){
    Department.find({school:req.school._id}, {abbr:1, name:1}, {sort:{abbr:1}}, function(err, departments){
      res.render('schedule/launch-schedule', {departments: departments, link: false, school: req.school._id, noJS: true});
    })
  })
  app.get('/schedule/link/:hash', function(req, res){
    res.redirect('/sl/'+req.params.hash);
  });
  app.get('/sl/:hash', function(req, res){
    res.redirect('/s/l/'+req.params.hash);
  });

  /**
  *
  * Backbone.js routes
  *
  **/



  // List of schedules for this user
  app.get('/schedules', requireLogin, function(req, res){
    Schedule.find({user: req.user}).exec(function(err, schedules){
      res.json(schedules)
    })
  })

  //Load schedule
  app.get('/schedules/:id', requireLogin, function(req, res){
    Schedule.find({_id: req.params.id, user: req.user}).exec(function(err, schedule){
      if (err){
        res.send(500);
        return;
      }else if (!schedule){
        res.send(400)
        return;
      }
      res.json(schedule);
    })
  })

  // Save new schedule
  app.post('/schedules', requireLogin, requireSchool, function(req, res){
    passedJSON = JSON.parse(JSON.stringify(req.body))
    passedJSON.name = passedJSON.name || "";
    delete passedJSON.__v;
    delete passedJSON._id;
    newSchedule = new Schedule(passedJSON)
    newSchedule.user = req.user
    newSchedule.school = req.school
    newSchedule.term = passedJSON.term._id
    newSchedule.save(function(err, schedule){
      req.user.schedule = schedule;
      req.user.save();
      if (err){
        res.send(500);
      }else{
        res.json({_id: newSchedule.id, term: schedule.term});
      }
    })

  })

  // Save updates to schedule schedule
  app.put('/schedules/:id', requireLogin, requireSchool, function(req, res){
    Schedule.findOne({_id: req.params.id, user: req.user}).exec(function(err, schedule){
      if (err){
        res.send(500);
        return
      }else if (!schedule){
        res.send(403) // Forbidden status
        return;
      }
      passedJSON = JSON.parse(JSON.stringify(req.body));
      delete passedJSON.__v;
      delete passedJSON._id;
      delete passedJSON.term;
      passedJSON.user = req.user;
      passedJSON.school = req.school;
      schedule.set(passedJSON);
      schedule.save(function(err){
        req.user.schedule = schedule;
        req.user.save();
        if ( err ){
          res.send(500);
        }else{
          res.json({_id: schedule.id, term: schedule.term});
        }
      })
    })
  })





  // Link Schedules
  app.post('/links', function(req, res){
    makeLink(req, res);
  })
  app.put('/links/:hash?', function(req, res){
    makeLink(req,res);
  })
  app.get('/links/:hash', function(req, res){
    ScheduleLink.findOne({hash:req.params.hash}, function(err,link){
      if ( err || !link ){ res.send(404); return; }
      res.json(link);
    })
  })


  var makeLink = function(req, res){
    function randomHash(){
      return (((1+Math.random())*0x10000000)|0).toString(34).substr(1)
    }
    var fromClientSide = req.body;
    link = new ScheduleLink()
    link.schedule = fromClientSide.schedule
    link.schedule._id = undefined;
    if ( req.user ){
      link.user = req.user._id
    }
    ScheduleLink.findOne({
          '_schedule.term._id': link.schedule.term.id||link.schedule.term._id
        , '_schedule.name' : link.schedule.name
        , '_schedule.school' : link.schedule.school
        , '_schedule.sections._id': {$all : link.schedule.sections.map(function(e){return e._id}) }
        }, function(err, existingLink){
      if ( err ){ console.error(err); }
      if ( !existingLink ){
        link.hash = randomHash()
        link.save(function(err){
          if ( err ){ console.log(err); }
          shareLink = app.createLink('http://'+req.headers.host+'/s/l/'+link.hash, req.user)
          res.json(link)
        })
      }else{
        app.getExistingLink('http://'+req.headers.host+'/s/l/'+existingLink.hash, req.user, function(shareLink){
          res.json(existingLink)
        })
      }
    });
  }







  /**
  *
  * Schedule CRUD
  *
  **/
  app.get('/schedule/load/:sid', requireLogin, requireSchool, function(req, res){
    Schedule.findOne({_id: req.params.sid, user: req.user._id}).exec(function(err, schedule){

      sectionIds = schedule.sections.map(function(s){return s['_id'] || s});

      Section.find({_id:{$in: sectionIds}}).populate('course').populate('department').exec(function(err, sections){
        schedule.sections = sections;
        sJson = JSON.stringify(schedule)
        res.json(schedule)
      })

    })
  })
  app.get('/schedule/load', requireSchool, function(req, res){
    function returnNew(){
      var schedule = new Schedule().toObject()
        , termId = req.school['currentTerm'] ? req.school.currentTerm._id : req.school.terms[req.school.terms.length-1]

      schedule.school = req.school._id;
      delete schedule._id;
      Term.findOne({_id: termId}, function(err, term){
        schedule.term = term;
        res.json(schedule);
      })
    }
    if (req.loggedIn && req.user.schedule !== undefined ){
      Schedule.findById(req.user.schedule, function(err, foundSchedule){
        if ( err ){
          returnNew()
        }
        res.json(schedule);
      })
    }else{
      returnNew()
    }
  })
  app.get('/schedule/dialog/load', requireLogin, function(req, res){
    Schedule.find({user: req.user}).populate('term').exec(function(err, schedules){
      res.render('schedule/dialogs/load', {schedules: schedules})
    })
  })
  app.get('/schedule/save', requireLogin, function(req, res){
    res.render('schedule/dialogs/save', {user: req.user})
  })
  app.put('/schedule/save', requireLogin, requireSchool, function(req, res){
    var passedJSON = JSON.parse(req.body.schedule)
    passedJSON.term = passedJSON.term.id
    passedJSON.school = req.school._id
    passedJSON.user = req.user._id
    Schedule.findOne({_id: passedJSON.id}, function(err, schedule){
      // Test if this is a new schedule
      if ( !schedule ){
        delete passedJSON.id;
        delete passedJSON._id;
        newSchedule = new Schedule(passedJSON)
        newSchedule.save(function(){
          res.json(newSchedule)
        })
      }else{
        // Update things
        schedule.name = passedJSON.name
        schedule.sections = passedJSON.sections
        schedule.save(function(){
          if ( err ){ console.log('--Schedule save--', err); }
          res.json(schedule)
        })
      }
    })
  })
  app.get('/schedule/delete/:sid', requireLogin, function(req, res){
    Schedule.findOne({_id: req.params.sid, user:req.user._id}, function(err, schedule){
      if ( schedule ){
        schedule.remove()
      }
      res.json(true)
    })
  })


  /**
  *
  * Dialogs
  *
  **/
  app.get('/schedule/dialog/new', requireSchool, function(req, res){
    Term.find({school:req.school._id}, {number:1,name:1,season:1,year:1}, {sort:{number:-1}}, function(err, terms){
      res.render('schedule/dialogs/new', {terms: terms })
    })
  });
  app.get('/schedule/dialog/numbers', function(req, res){
    res.render('schedule/dialogs/numbers')
  })
  app.get('/schedule/dialog/link', function(req, res){
    res.render('schedule/dialogs/link')
  })
  app.post('/schedule/link', function(req, res){
    function randomHash(){
      return (((1+Math.random())*0x10000000)|0).toString(34).substr(1)
    }
    var pSchedule = JSON.parse(req.body.schedule);
    delete pSchedule._id;
    delete pSchedule.id;
    delete pSchedule.user;
    link = new ScheduleLink()
    link.schedule = pSchedule;
    if ( req.user ){
      link.user = req.user._id
    }
    // This bit doesnt seem to work right... it always makes a new link
    ScheduleLink.findOne({
          '_schedule.term.id': link.schedule.term.id
        , '_schedule.name' : link.schedule.name
        , '_schedule.school' : link.schedule.school
        , '_schedule.sections.id': {$all : link.schedule.sections.map(function(e){return e._id}) }
        }, function(err, existingLink){
      if ( err ){ console.log(err); }
      if ( !existingLink ){
        link.hash = randomHash()
        link.save(function(err){
          shareLink = app.createLink('http://'+req.headers.host+'/sl/'+link.hash, req.user)
          res.json({id: link.id, url: shareLink.toString(), err: err})
        })
      }else{
        app.getExistingLink('http://'+req.headers.host+'/sl/'+existingLink.hash, req.user, function(shareLink){
          res.json({id: existingLink._id, url: shareLink.toString(), err:err})
        })
      }
    })
  })



  /**
  *
  * Components
  *
  **/
  app.get('/school', requireSchool, function(req, res){
    res.json(req.school);
  })

  app.get('/schedule/terms', requireSchool, function(req, res){
    Term.find({school: req.school}, function(err, terms){
      res.json(terms)
    })
  })
  app.get('/school/departments', requireSchool, function(req, res){
    Department.find({school: req.school}, {}, {sort:{abbr:1}}, function(err, departments){
      res.json(departments)
    })
  })
  app.get('/school/departments/:sid', function(req, res){
    var id = req.params.sid || ''
    Department.find({school: id}, {}, {sort:{abbr:1}}, function(err, departments){
      res.json(departments)
    })
  })
  app.get('/term/:tid/courses/:did', function(req, res){
    termId = new ObjectId(req.params.tid)
    departmentId = new ObjectId(req.params.did)
    Course.find({terms: termId, department: departmentId }, {number:1, name:1, department:1}, {sort:{number:1}}).populate('department').exec(function(err, courses){
      res.json(courses)
    })
  })
  app.get('/term/:tid/sections/:cid', function(req, res){
    courseId = new ObjectId(req.params.cid)
    Section.find({course: courseId, term: req.params.tid}, {}, {sort:{number:1}}, function(err, sections){
      res.json(sections)
    })
  })
  app.get('/term/:tid/sections/:cid/full', function(req, res){
    courseId = new ObjectId(req.params.cid)
    Section.find({course: courseId, seatsAvailable: 0 }, function(err, sections){
      res.json(sections)
    })
  })


  seats.on('connection', function (socket) {
    socket.on('update', function(sectionId){
      var now = new Date()
        , FIFTEEN_MINUTES = 1000 * 60 * 15
      Section.findById(sectionId).exec(function(err, section){
        Term.findById(section.term).populate('school').exec(function(err, term){
          if ( term.active ){
            crawler[term.school.abbr].safeUpdateSection(section, FIFTEEN_MINUTES, function(err, section){
              socket.emit('result', {id: section.id, avail: section.seatsAvailable, total: section.seatsTotal, section: section})
            })
          }else{
            var avail = section.seatsAvailable?section.seatsAvailable:'-'
              , tot = section.seatsTotal?section.seatsTotal:'?';
            socket.emit('result', {id: section.id, avail: avail, total: tot, section: section})
          }
        })
      })
    })
  })
}
