var 	util = require('../lib/utils')
		,	crypto = require('ezcrypto').Crypto

exports = module.exports = function (app){
	mongoose.model('User', User);
	app.User = User = mongoose.model('User');
}

User = new Schema({
	  email: {type: String, index: true, validate: [util.validatePresenceOf, 'you must enter an email'] }
	, hashPassword: {type: String, index: true}
	, firstName: {type: String, min: 1 }
	, lastName: String
	, school : { type: Schema.ObjectId, ref: 'School' }
	, department:{ type: Schema.ObjectId, ref: 'Department' }
	, year:{ type: Number }
	, canEmailFriendRequests: { type: Boolean, default: true }
	, autoAcceptFriends: { type: Boolean, default: false }
	, friends: [{ type: Schema.ObjectId, ref: 'User' }]
	, loginCount: { type: Number }
	, lastLogin: { type: Date, default: Date.now }
	, created: { type: Date, default: Date.now }
	, modified: { type: Date, default: Date.now }
	, oauth: String
	, admin: { type: Boolean, default: false }
});

User.virtual('password')
	.get( function (){ return this._password } )
	.set( function (pass){ 
		this.setPassword(pass);
		this._password = pass;
	});

User.virtual('id')
	.get( function (){ return this._id.toHexString() } )

User.virtual('name')
	.get( function () { return (""+this.fistName+" "+this.lastName).trim() })
	.set( function (fullName) {
		p = fullName.split(' ');
		this.firstName = p[0];
		this.lastName = p[1];
	});

User.method('encryptPassword', function (pass) {
	return crypto.MD5(pass, { asString: true });
});

User.method('setPassword', function (pass) {
	return this.hashPassword = this.encryptPassword(pass);
});

User.method('authenticate', function (plainText) {
	return this.hashPassword == this.encryptPassword(plainText);
});

User.pre('save', function (next) {
	if ( !this.oauth && !util.validatePresenceOf(this.password) )
		next(Error('No password specified'))
	else
		next();
});

User.method('isFriend', function(user) { 
	for ( var _len=this.friends.length,_i=0; _i<_len; _i++ ){
		if ( this.friends[_i] == user || this.friends[_i] == user.id || this.friends[_i].id == user.id){
			return true
		}
	}
	return false;
});

User.method('removeFriend', function(user) { 
	for ( var _i=0; _i<this.friends.length; _i++ ){
		if ( this.friends[_i] == user || this.friends[_i] == user.id || this.friends[_i].id == user.id){
			this.friends.splice(_i, 1);
			_i--;
		}
	}
	return false;
});