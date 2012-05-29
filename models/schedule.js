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
});

ScheduleSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

ScheduleSchema.method('addSection', function(section){
	for( var i=0, len=this.sections.length; i<len; i++ ){
		if ( this.sections[i].toHexString() === section['_id'].toHexString() ){
			return;
		}
	}
	this.sections.push(section['_id'])
	this.save()
})