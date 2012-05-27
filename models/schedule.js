var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ScheduleSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Schedule', ScheduleSchema);
	app.Course = Course = mongoose.model('Course');
}

exports.ScheduleSchema = module.exports.ScheduleSchema = ScheduleSchema

ScheduleSchema = new Schema({
		name: { type: String }
	,	term: { type: Schema.ObjectId, ref: 'Term' }
	,	school: { type: Schema.ObjectId, ref: 'School' }
	,	user: { type: Schema.ObjectId, index: true }
	, sections: [{ type: Schema.ObjectId, ref: 'Section' }]
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