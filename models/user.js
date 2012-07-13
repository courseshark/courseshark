var util = require('../lib/utils')
	,	ezezcrypto = require('ezcrypto').crypto
	, crypto = require('crypto')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, UserSchema
	, algorithm = "aes256"
	, key = "qCi5zPedUoS6Yrl"

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
	,	referedFrom: { type: String }
	, created: { type: Date, 'default': Date.now }
	, modified: { type: Date, 'default': Date.now }
	, oauth: { type: String }
	, admin: { type: Boolean, 'default': false }
	, _schoolUserId: { type: Buffer }
	, _schoolPin: { type: Buffer }
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

UserSchema.virtual('schoolUserId')
	.get( function(){
		if (this._schoolUserId){
			return this.decryptSecure(this._schoolUserId)
		}else{
			return undefined
		}
	})
	.set( function(userIdTxt){
		this._schoolUserId = this.encryptSecure(userIdTxt.toString())
	})

UserSchema.virtual('schoolPin')
	.get( function(){
		if (this._schoolPin){
			return this.decryptSecure(this._schoolPin)
		}else{
			return undefined
		}
	})
	.set( function(userPinTxt){
		this._schoolPin = this.encryptSecure(userPinTxt)
	})





UserSchema.method('encryptSecure', function(text){
	var cipher = crypto.createCipher(algorithm, key)
	return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
})
UserSchema.method('decryptSecure', function(encrypted){
	var decipher = crypto.createDecipher(algorithm, key);
	return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
})

UserSchema.method('encryptPassword', function (plainText) {
	return ezcrypto.MD5(plainText || '')
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
		return 'https://secure.gravatar.com/avatar/'+ezcrypto.MD5(this.email)+'?s='+size+'&d=http%3A%2F%2Fplacehold.it%2F'+size+'x'+size+'%26text%3D'+this.initials;
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
