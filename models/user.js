var util = require('../lib/utils')
	,	crypto = require('ezcrypto').Crypto
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, UserSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('User', UserSchema);
	app.User = User = mongoose.model('User');
}

exports.UserSchema = module.exports.UserSchema = UserSchema

UserSchema = new Schema({
		email: {type: String, index: true, validate: [util.validatePresenceOf, 'you must enter an email'] }
	, hashPassword: {type: String, index: true}
	, firstName: {type: String, min: 1 }
	, lastName: String
	, school : { type: Schema.ObjectId, ref: 'School' }
	, department:{ type: Schema.ObjectId, ref: 'Department' }
	, year:{ type: Number }
	, canEmailFriendRequests: { type: Boolean, 'default': true }
	, autoAcceptFriends: { type: Boolean, 'default': false }
	, friends: [{ type: Schema.ObjectId, ref: 'User' }]
	, loginCount: { type: Number }
	, lastLogin: { type: Date, 'default': Date.now }
	, created: { type: Date, 'default': Date.now }
	, modified: { type: Date, 'default': Date.now }
	, oauth: String
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
	.get( function () { return (""+this.fistName+" "+this.lastName).trim() })
	.set( function (fullName) {
		p = fullName.split(' ');
		this.firstName = p[0];
		this.lastName = p[1];
	});

UserSchema.method('encryptPassword', function (pass) {
	return crypto.MD5(pass, { asString: true });
});

UserSchema.method('setPassword', function (pass) {
	return this.hashPassword = this.encryptPassword(pass);
});

UserSchema.method('authenticate', function (plainText) {
	return this.hashPassword == this.encryptPassword(plainText);
});

UserSchema.pre('save', function (next) {
	if ( !this.oauth && !util.validatePresenceOf(this.password) )
		next(Error('No password specified'))
	else
		next();
});

UserSchema.method('isFriend', function(user) {
	for ( var _len=this.friends.length,_i=0; _i<_len; _i++ ){
		if ( this.friends[_i] == user || this.friends[_i] == user.id || this.friends[_i].id == user.id){
			return true
		}
	}
	return false;
});

UserSchema.method('removeFriend', function(user) {
	for ( var _i=0; _i<this.friends.length; _i++ ){
		if ( this.friends[_i] == user || this.friends[_i] == user.id || this.friends[_i].id == user.id){
			this.friends.splice(_i, 1);
			_i--;
		}
	}
	return false;
});