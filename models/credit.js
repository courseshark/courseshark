var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, CreditSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Credit', CreditSchema);
	app.Credit = Credit = mongoose.model('Credit');
}

exports.CreditSchema = module.exports.CreditSchema = CreditSchema

CreditSchema = new Schema({
		user: {type: Schema.ObjectId, ref: 'User'}
	,	orderId: {type: String}
	, used: {type: Boolean, 'default': false}
	, item: {type: Schema.ObjectId, ref: 'Notification'}
	, usedOn: {type: Date}
	, createdOn: {type: Date, 'default': Date.now()}
});

CreditSchema.virtual('id')
	.get(function (){return this._id.toHexString()})