var util = require('../lib/utils')
  , cleanUserObject = require('../lib/user').cleanUserObject
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
  , firstName: String
  , lastName: String
  , phone: String

  , school : { type: Schema.ObjectId, ref: 'School' }
  , major:{ type: Schema.ObjectId, ref: 'Department' }
  , year:{ type: Number }

  , shareWithRecruiters: { type: Boolean, 'default': true }
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

  , _schedule: { type: {} }
});

UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })


UserSchema.methods.toJSON = function(options) {
  if (!(options && 'Object' == options.constructor.name)) {
    options = this.schema.options.toJSON
      ? (function(o){var t={},i;for(i in o){if(o.hasOwnProperty(i)){t[i]=o[i]}}return t})(this.schema.options.toJSON)
      : {};
  }
  var objectified = this.toObject(options)
  return cleanUserObject(objectified)
}


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

UserSchema.virtual('schedule')
  .get( function () { return this._schedule })
  .set( function (schedule) {
    this.markModified('_schedule');
    this._schedule = schedule;
  });
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

UserSchema.virtual('avatar').get(function(){
  if ( this.oauthInfo ){
    if ( this.oauthInfo.facebook ){
      return 'https://graph.facebook.com/'+this.oauthInfo.facebook.id+'/picture'
    } else if ( this.oauthInfo.google && this.oauthInfo.google.picture ){
      return this.oauthInfo.google.picture
    } else if ( this.oauthInfo.twitter && !this.oauthInfo.twitter.default_profile_image ){
      return this.oauthInfo.twitter.profile_image_url_https;
    } else if ( this.oauthInfo.linkedin ){
      return this.oauthInfo.linkedin.pictureUrl;
    }
  }
  if ( this.email ){
    return 'https://secure.gravatar.com/avatar/'+crypto.MD5(this.email)+'?s=75&d=identicon';
  } else {
    return 'http://www.gravatar.com/avatar/00000000000000000000000000000000';
  }
})

UserSchema.virtual('avatarFrom').get(function(){
  if ( this.oauthInfo ){
    if ( this.oauthInfo.facebook ){
      return 'Facebook'
    } else if ( this.oauthInfo.google && this.oauthInfo.google.picture ){
      return 'Google'
    } else if ( this.oauthInfo.twitter && !this.oauthInfo.twitter.default_profile_image ){
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

UserSchema.method('getUsersIRequestedToByMyFriend', function(callback){
  User.find({_id: {$in: this.friends}, school: this.school, friends: {$ne: this._id}}, callback)
})

UserSchema.method('getFriendRequests', function(callback){
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
    if ( otherInfo.facebook && otherInfo.facebook.email == this.email){
      return true
    }
    else if ( thisInfo.facebook && thisInfo.facebook.email == userObj.email){
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
    // LinkedIn email check
    // Facebook email check
    if ( otherInfo.linkedin && otherInfo.linkedin.email == this.email){
      return true
    }
    else if ( thisInfo.linkedin && thisInfo.linkedin.email == userObj.email){
      return true;
    }
  } // end LinkedIn checks
  return false;
})


exports.UserSchema = module.exports.UserSchema = UserSchema;