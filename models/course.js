var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, CourseSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Course', CourseSchema);
	app.Course = Course = mongoose.model('Course');
}

CourseSchema = new Schema({
		name: { type: String }
	,	terms: [{ type: Schema.ObjectId, ref: 'Term' }]
	, school: { type: Schema.ObjectId, ref: 'School', index: true }
	,	department: { type: Schema.ObjectId, ref: 'Department' }
	,	number: { type: String, index: true }
	, sections: [{ type: Schema.ObjectId, ref: 'Section' }]
	, _tokens: []
});

CourseSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

CourseSchema.method('addSection', function(section){
	if ( !section ){
		return;
	}
	for( var i=0, len=this.sections.length; i<len; i++ ){
		if ( this.sections[i].toHexString() === section['_id'].toHexString() ){
			return;
		}
	}
	this.sections.push(section['_id'])
	this.save()
})

exports.CourseSchema = module.exports.CourseSchema = CourseSchema
