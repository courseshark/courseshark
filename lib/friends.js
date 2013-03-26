try {
  var MandrillAPI = require('mailchimp').MandrillAPI
    , mandrill = new MandrillAPI(process.env.COURSESHARK_MANDRILL_KEY, { version : '1.0', secure: false });
} catch (error) {
  console.log('Mandrill Error: ' + error);
}


module.exports.sendInviteEmailToFriendFromUser = function(friend, user){

  if ( !process.env.NODE_ENV || process.env.NODE_ENV == "development" ){
    console.log ("Would send friend_invite email to `"+friend.email+"` from "+user.name);
    return;
  }
  mandrill.messages_send_template({
      template_name:'friend_invite'
    , template_content:''
    , message:{
        subject: 'CourseShark Friends'
      , from_email: 'friends@courseshark.com'
      , from_name: 'CourseShark Friends'
      , track_opens: true
      , track_clicks: true
      , auto_txt: true
      , to: [{name: friend.name, email: friend.email}]
      , template_content: []
      , global_merge_vars:[
          {name: 'CURRENT_YEAR', content: (new Date()).getFullYear()}
        , {name: 'SUBJECT', content: 'Friend Invite'}]
      , merge_vars:[{
          rcpt: friend.email
        , vars:[
            {name: 'FNAME', content: user.firstName}
          , {name: 'SENDER', content: friend.name}
        ]}]
      , tags: ['friends', 'invite']
      }
    }, function (data){
      if ( data.status == 'error' ){
        console.log('ERROR: friend-email-send',data)
      }
  })
}
