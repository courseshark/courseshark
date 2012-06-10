var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, NotificationFeedbackSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('NotificationFeedback', NotificationFeedbackSchema);
	app.NotificationFeedback = NotificationFeedback = mongoose.model('NotificationFeedback');
}

exports.NotificationFeedbackSchema = module.exports.NotificationFeedbackSchema = NotificationFeedbackSchema

NotificationFeedbackSchema = new Schema({
		user: { type: Schema.ObjectId, ref: 'User' }
	, notification: { type: Schema.ObjectId, ref: 'Notification' }
	,	ignore: { type: Boolean, 'default': false }
	,	success: { type: Boolean, 'default': false }
	, note: { type: String }
	, createdAt: { type: Date, 'default': Date.now() }
});

NotificationFeedbackSchema.virtual('id')
	.get(function (){return this._id.toHexString()})