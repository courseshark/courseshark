var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, SectionSchema
	, TimeslotSchema = require('./timeslot').TimeslotSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Section', SectionSchema);
	app.Section = Section = mongoose.model('Section');
}

exports.SectionSchema = module.exports.SectionSchema = SectionSchema

SectionSchema = new Schema({
		number: { type: Number, index: true }
	,	info: { type: String }
	,	type: { type: String }
	,	course: { type: Schema.ObjectId, index: true, ref: 'Course' }
	, department: { type: Schema.ObjectId, index: true, ref: 'Department' }
	,	parent: { type: Schema.ObjectId, ref: 'Section' }
	, credits: { type: String }
	, seatsAvailable: { type: Number }
	, seatsTotal: { type: Number }
	, timeslots: [ TimeslotSchema ]
	, deleted: { type: Boolean, 'default': false }
	, updated: { type: Date, 'default': Date.now }
});

SectionSchema.virtual('id')
	.get(function (){return this._id.toHexString()})