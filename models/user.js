var util = require('../lib/utils')
  , crypto = require('ezcrypto').Crypto
  , mongoose = require('mongoose')
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
  if ( this.email ) {
    return 'https://secure.gravatar.com/avatar/'+crypto.MD5(this.email)+'?s='+size+'&d=http%3A%2F%2Fplacehold.it%2F'+size+'x'+size+'%26text%3D'+this.initials;
  }else{
    return "http://placehold.it/"+size+'x'+size+'?text='+this.initials;
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

exports.UserSchema = module.exports.UserSchema = UserSchema;