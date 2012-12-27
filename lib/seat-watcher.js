var cronJob = require('cron').CronJob
  , crawler = require('./crawler')
  , TwilioClient = require('twilio').Client
  , twilio
  , MandrillAPI = require('mailchimp').MandrillAPI
  , mandrill
  , outgoingNumber = ''
  , sendNotification
  , run
  , onUpdate
  , notificationCrons = {}
  , domain

sendNotification = function(notification, section, settings){
  var seats = settings['seats'] || 'unknown'
    , waitlist = !!settings['waitlist'] || false
    , number = notification.phone.replace(/[^0-9]/g, '')
    , pluralize
    , seatsTxt

  if ( number.length >= 10 && notification.sent===false ){
    var message = "We found "+seats+" "+(waitlist?"waitlist ":"")+"seats open in "+section.name
      , to = number
    twilio.sendSms(outgoingNumber, to, message, false, function(info){
      notification.smsInfo.push(info)
      notification.sent = true
      notification.lastSent = Date.now()
      notification.save();
    })
    console.log('[msg-sent] Sent SMS notification',notification.id,'with messgage',message);
  }else{
    // Send email
    pluralize = (seats===1)?'seat':'seats'
    seatsTxt = seats + (waitlist?' waitlist ':' ') + pluralize
    console.log('[msg-send] Email: ',notification.id,'to',{name: notification.user.name, email: notification.email, section:section.name, seats:seats});

    mandrill.messages_send_template({
        template_name:'notification_seats'
      , template_content:''
      , message:{
          subject: 'SeatWatcher Alert'
        , from_email: 'alert@courseshark.com'
        , from_name: 'CourseShark SeatWatcher'
        , track_opens: true
        , track_clicks: true
        , auto_txt: true
        , to: [{name: notification.user.name, email: notification.email}]
        , template_content: []
        , global_merge_vars:[
            {name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
          , {name: 'SUBJECT', content: 'SeatWatcher'}
          , {name: 'NOW', content: (new Date(section.updated)).toTimeString()}]
        , merge_vars:[{
            rcpt: notification.email
          , vars:[
              {name: 'FNAME', content: notification.user.firstName}
            , {name: 'SECTION', content: section.name}
            , {name: 'SEAT_TEXT', content: seatsTxt}
            , {name: 'REMOVE_LINK', content: 'http://'+domain+''+notification.deleteLink}]
          }]
        , tags: ['notification', (waitlist?'waitlist':'seat')]
        }
      }, function (err, data){
        if ( err ){
          console.log('Madrill send error:', err, notification);
          return;
        }else{
          console.log('[msg-sent] Sent Email notification',notification.id,'to',{name: notification.user.name, email: notification.email, seats: seats, sname: section.name, section: section});
          notification.sent = true;
          notification.lastSent = Date.now();
          notification.save();
        }
    })
  }
}

exports.boot = function(){
  var conf = process.env;
  twilio = new TwilioClient(conf.COURSESHARK_TWILIO_SID, conf.COURSESHARK_TWILIO_AUTH_TOKEN, conf.COURSESHARK_DOMAIN);
  outgoingNumber = conf.COURSESHARK_TWILIO_NUMBER;
  domain = conf.COURSESHARK_DOMAIN;
  try {
    mandrill = new MandrillAPI(conf.COURSESHARK_MANDRILL_KEY, { version : '1.0', secure: false });
  } catch (error) {
    console.log('Mandrill Error: ' + error);
    return;
  }
  return exports;
}


exports.updateRunningSchools = function(){
  School.find({}, function(err, schools){
    if ( err ){console.error(err);return;}
    for ( var i=0,len=schools.length; i<len; i++ ){
      (function(school){
        if ( school.enabled && school.notifications ){
          startSchool(school);
        }else{
          stopSchool(school);
        }
      })(schools[i]);
    }
  })
}


exports.startSchool = startSchool = function(school){
  if ( notificationCrons[school.abbr] ){
    return;
  }
  console.log('[CRON] Setup for '+school.abbr+'\t| Rule '+school.notificationCron);
  notificationCrons[school.abbr] = new cronJob({
      cronTime: school.notificationCron
    , onTick: function(){run(school)}
    , start: true
  });
  notificationCrons[school.abbr].start();
}

exports.stopSchool = stopSchool = function(school){
  if ( !notificationCrons[school.abbr] ){
    return;
  }
  console.log('[CRON] Stopping '+school.abbr);
  notificationCrons[school.abbr].stop();
  notificationCrons[school.abbr] = false;
}


function run(school){
  console.log("[msg] Running for "+school.abbr);

  Notification
    .find({hidden: false, deleted: false, school: school._id})
    .populate('section')
    .populate('school')
    .populate('user')
    .exec(function(err, notifications){
      console.log("[msg] Found "+notifications.length+" notifications", notifications.length?notifications[0].school.abbr:'');
      for(var i=0,len=notifications.length; i<len; i++){
        (function(notification){

          Term.findOne({_id: notification.section.term}, function(err, term){
            if ( err ){ console.log('ERROR: Term-SeatWacher ', err, notification._id); return; }
            if ( term.active ){
              //console.log("[msg] updating seat information n:",notification.id,'s:',notification.section._id, 't:',(new Date()));
              if ( notification.school.id != school.id ){
                console.log('---school----', notification.school.abbr,'!=',school.abbr, school,notification.school)
              }
              crawler[notification.school.abbr].safeUpdateSection(notification.section, 15*1000, (function(notification){
                  return function(err, section, html){
                          if ( err ){ console.log('update fatal err', err, section); return; }
                          // This check is required b/c SPSU updates all classes in a major
                          if ( section.id!=notification.section._id ){
                            //console.log("[err!]  section sanity check fail! ", notification.id, notification.school.abbr);
                            return;
                          }

                          var historyI = notification.history.length - 1;
                          if ( section['seatsAvailable'] === "undefined" ){
                            return;
                          }

                          console.log(section.name,'=',section.seatsAvailable);
                          if ( section.seatsAvailable == 25 || isNaN(section.seatsAvailable) ){
                            console.log("\n\n\n\n\n");
                            console.log(html);
                            console.log("\n\n\n\n\n");
                          }

                          // Check the section to see if we need to notify the user
                          if ( notification.waitlist && section.waitSeatsAvailable > 0 ){
                            if ( section.waitSeatsAvailable > 0 && section.waitSeatsAvailable != notification.history[historyI] ){
                              //send based on waitlist
                              console.log("[msg]   sending on waitlist "+notification.id);
                              sendNotification(notification, section, {waitlist: true, seats: section.waitSeatsAvailable});
                            }
                            if ( section.waitSeatsAvailable != notification.history[historyI] || historyI===-1 ){
                              notification.history.push(parseInt(section.waitSeatsAvailable,10));
                              notification.save(function(err){
                                if ( err ){ console.error('Error updating notification history-',err); return;}
                              })
                            }
                          }else{
                            if ( section.seatsAvailable > 0 && section.seatsAvailable != notification.history[historyI] ){
                              console.log("[msg]   sending on seats "+notification.id, section.seatsAvailable);
                              sendNotification(notification, section, {waitlist: false, seats: section.seatsAvailable});
                            }
                            // Update notification history
                            if ( section.seatsAvailable != notification.history[historyI] || historyI===-1 ){
                              notification.history.push(parseInt(section.seatsAvailable,10));
                              notification.save(function(err){
                                if ( err ){ console.error('Error updating notification history',err,notification); return;}
                              })
                            }
                          }
                        }
                })(notification)
              );
            }else{
              return;
            }
          })
        })(notifications[i]);
      }
    });
}
