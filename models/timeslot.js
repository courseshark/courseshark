var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, TimeslotSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Timeslot', TimeslotSchema);
	app.Timeslot = Timeslot = mongoose.model('Timeslot');
}

exports.TimeslotSchema = module.exports.TimeslotSchema = TimeslotSchema

TimeslotSchema = new Schema({
		days: [ { type: String } ]
	,	startTime: { type: Date }
	,	endTime: { type: Date }
	, endDate: {type: Date}
	,	type: { type: String }
	, location: { type: String }
	, instructor: { type: String }
});

TimeslotSchema.virtual('id')
	.get(function (){return this._id.toHexString()})