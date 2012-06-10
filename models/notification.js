var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, NotificationFeedbackSchema = require('./notificationFeedback').NotificationFeedbackSchema
	, NotificationSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Notification', NotificationSchema);
	app.Notification = Notification = mongoose.model('Notification');
}

exports.NotificationSchema = module.exports.NotificationSchema = NotificationSchema

NotificationSchema = new Schema({
		user: { type: Schema.ObjectId, ref: 'User' }
	, section: { type: Schema.ObjectId, ref: 'Section' }
	, waitlist: { type: Boolean, 'default': false }
	,	email: { type: String }
	,	phone: { type: String }
	, history: [{ type: Number }]
	, sent: { type: Boolean, 'default': false }
	, deleted: { type: Boolean, 'default': false }
	, hidden: { type: Boolean, 'default': false }
	, school: { type: Schema.ObjectId, ref: 'School' }
});

NotificationSchema.virtual('id')
	.get(function (){return this._id.toHexString()})