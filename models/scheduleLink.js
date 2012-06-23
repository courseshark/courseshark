var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ScheduleLinkSchema
	, ScheduleSchema = require('./schedule').ScheduleSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('ScheduleLink', ScheduleLinkSchema);
	app.ScheduleLink = ScheduleLink = mongoose.model('ScheduleLink');
}

exports.ScheduleLinkSchema = module.exports.ScheduleLinkSchema = ScheduleLinkSchema

ScheduleLinkSchema = new Schema({
			_schedule: [ScheduleSchema]
		,	hash: { type: String }
		,	user: { type: Schema.ObjectId, ref:'User' }
		, createdOn: { type: Date }

});

ScheduleLinkSchema.pre('save', function(next){
	if ( !this.createdOn ){
		this.createdOn = Date.now();
	}
	next();
})

ScheduleLinkSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

ScheduleLinkSchema.virtual('schedule')
	.set(function (schedule){return this._schedule=[schedule]})
	.get(function (){return this._schedule[0]})