var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('Section', Section);
	app.Section = Section = mongoose.model('Section');
}


Section = new Schema({
		number: { type: Number, index: true }
	,	info: { type: String }
	,	type: { type: String }
	,	course: { type: Schema.ObjectId, index: true, ref: 'Course' }
	, department: { type: Schema.ObjectId, index: true, ref: 'Department' }
	,	parent: { type: Schema.ObjectId, ref: 'Section' }
	, instructor: { type: Schema.ObjectId, index: true, ref: 'Instructor' }
	, credits: { type: String }
	, seatsAvailable: { type: Number }
	, seatsTotal: { type: Number }
	, timeslots: [ { type: Schema.ObjectId, ref: 'Timeslot' } ]
	, deleted: { type: Boolean, default: false }
	, updated: { type: Date, default: Date.now }
});

Section.virtual('id')
	.get(function (){return this._id.toHexString()})