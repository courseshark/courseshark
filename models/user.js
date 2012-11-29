var util = require('../lib/utils')
  , crypto = require('ezcrypto').Crypto
  , mongoose = require('mongoose')
  , ScheduleSchema = require('./timeslot').ScheduleSchema
  , Schema = mongoose.Schema
  , UserSchema

exports.boot = module.exports.boot = function (app){
  mongoose.model('User', UserSchema);
  app.User = User = mongoose.model('User');
}

UserSchema = new Schema({
    email: {type: String, index: true }
  , hashPassword: {type: String, index: true}
  , firstName: {type: String, min: 1 }
  , lastName: String
  , school : { type: Schema.ObjectId, ref: 'School' }
  , major:{ type: Schema.ObjectId, ref: 'Department' }
  , year:{ type: Number }
  , shareWithRecruiters: { type: Boolean }
  , canEmailFriendRequests: { type: Boolean, 'default': true }
  , autoAcceptFriends: { type: Boolean, 'default': false }
  , friends: [{ type: Schema.ObjectId, ref: 'User' }]
  , loginCount: { type: Number, 'default': 0 }
  , lastLogin: { type: Date, 'default': Date.now }
  , referedFrom: { type: String }
  , created: { type: Date, 'default': Date.now }
  , modified: { type: Date, 'default': Date.now }
  , oauth: { type: String }
  , oauthInfo: {type: {}}
  , admin: { type: Boolean, 'default': false }
  , schedule: [ScheduleSchema]
});

UserSchema.virtual('password')
  .get( function (){ return this._password } )
  .set( function (pass){
    this.setPassword(pass)
    this._password = pass
  });

UserSchema.virtual('id')
  .get( function (){ return this._id.toHexString() } )

UserSchema.virtual('name')
  .get( function () { return (""+this.firstName+(this.lastName?" "+this.lastName:'')).trim() })
  .set( function (fullName) {
    p = fullName.split(' ')
    this.firstName = p[0]
    this.lastName = p[1]
  });
UserSchema.virtual('initials')
  .get( function() { return ((""+this.firstName).substring(0,1))+((""+(this.lastName?this.lastName:' ')).substring(0,1).trim())})

UserSchema.method('encryptPassword', function (plainText) {
  return crypto.MD5(plainText || '')
});

UserSchema.method('setPassword', function (plainText) {
  this.hashPassword = this.encryptPassword(plainText)
  return this
});

UserSchema.method('authenticate', function (plainText) {
  return this.hashPassword == this.encryptPassword(plainText)
});

UserSchema.method('isPasswordless', function(){
  return !(this.hashPassword && this.hashPassword.length)
})

UserSchema.pre('save', function (next) {
  this.modified = new Date();
  if ( !this.oauth && !util.validatePresenceOf(this.hashPassword) ){
    console.log(this.oauth, this.hashPassword);
    next(Error('No password specified'))
  }else{
    next();
  }
});

UserSchema.method('avatar', function(size){
  size = size || 64
  if ( this.oauthInfo ){
    if ( this.oauthInfo.facebook ){
      return 'https://graph.facebook.com/'+this.oauthInfo.facebook.id+'/picture'
    } else if ( this.oauthInfo.twitter ){
      return this.oauthInfo.twitter.profile_image_url_https;
    } else if ( this.oauthInfo.linkedin ){
      return this.oauthInfo.linkedin.pictureUrl;
    }
  } else {
    return 'https://secure.gravatar.com/avatar/'+crypto.MD5(this.email||'')+'?s='+size+'&d=identicon';
  }
})

UserSchema.method('avatarFrom', function(){
  if ( this.oauthInfo ){
    if ( this.oauthInfo.facebook ){
      return 'Facebook'
    } else if ( this.oauthInfo.twitter ){
      return 'Twitter'
    } else if ( this.oauthInfo.linkedin ){
      return 'LinkedIn'
    }
  } else {
    return 'Gravatar';
  }
})

UserSchema.method('getFriends', function(callback){
  User.find({_id: {$in: this.friends}, school: this.school, friends: this._id}, callback)
})

UserSchema.method('getInvites', function(callback){
  User.find({_id: {$in: this.friends}, school: this.school, friends: {$ne: this._id}}, callback)
})

UserSchema.method('getInvited', function(callback){
  User.find({_id: {$nin: this.friends}, school: this.school, friends: this._id}, callback)
})

UserSchema.method('isDuplicate', function(userObj){

  if( !this.oauthInfo && !userObj.oauthInfo ){
    return this.email === userObj.email;
  }
  var thisInfo = this.oauthInfo
    , otherInfo = userObj.oauthInfo

  // Facebook checks
  if ( thisInfo.facebook || otherInfo.facebook ){
    // Facebook ID checks
    if ( thisInfo.facebook && otherInfo.facebook ){
      if ( thisInfo.facebook.id === otherInfo.facebook.id ){
        return true;
      }
    }
    // Facebook email check
    if ( this.email === otherInfo.facebook.email || thisInfo.facebook.email === userObj.email ){
      return true;
    }
  } // end Facebook checks


  // LinkedIn checks
  if ( thisInfo.linkedin || otherInfo.linkedin ){
    // Facebook ID checks
    if ( thisInfo.linkedin && otherInfo.linkedin ){
      if ( thisInfo.linkedin.id === otherInfo.linkedin.id ){
        return true;
      }
    }
    // Facebook email check
    if ( this.email === otherInfo.linkedin.email || thisInfo.linkedin.email === userObj.email ){
      return true;
    }
  } // end LinkedIn checks
  return false;
})


exports.UserSchema = module.exports.UserSchema = UserSchema;