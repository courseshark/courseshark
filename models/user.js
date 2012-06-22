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
		email: {type: String, index: true }
	, hashPassword: {type: String, index: true}
	, firstName: {type: String, min: 1 }
	, lastName: String
	, school : { type: Schema.ObjectId, ref: 'School' }
	, major:{ type: Schema.ObjectId, ref: 'Department' }
	, year:{ type: Number }
	, canEmailFriendRequests: { type: Boolean, 'default': true }
	, autoAcceptFriends: { type: Boolean, 'default': false }
	, friends: [{ type: Schema.ObjectId, ref: 'User' }]
	, loginCount: { type: Number }
	, lastLogin: { type: Date, 'default': Date.now }
	, created: { type: Date, 'default': Date.now }
	, modified: { type: Date, 'default': Date.now }
	, oauth: { type: String }
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