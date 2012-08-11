var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ScheduleSchema
	,	TermSchema = require('./term').TermSchema
	, SectionSchema = require('./section').SectionSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Schedule', ScheduleSchema);
	app.Schedule = Schedule = mongoose.model('Schedule');
}

exports.ScheduleSchema = module.exports.ScheduleSchema = ScheduleSchema

ScheduleSchema = new Schema({
		name: { type: String }
	,	term: { type: Schema.ObjectId, ref: 'Term' }
	,	school: { type: Schema.ObjectId, ref: 'School' }
	,	user: { type: Schema.ObjectId, index: true }
	, sections: [SectionSchema]
	, modified: { type: Date, 'default': Date.now() }
});

ScheduleSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

ScheduleSchema.pre('save', function (next) {
	this.modified = new Date();
	next();
});

ScheduleSchema.method('addSection', function(section){
	this.sections.push(section)
	this.save()
})