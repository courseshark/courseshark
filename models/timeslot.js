var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('Timeslot', Timeslot);
	app.Timeslot = Timeslot = mongoose.model('Timeslot');
}


Timeslot = new Schema({
	days: [ { type: String } ]
	,	startTime: { type: Date }
	,	endTime: { type: Date }
	,	type: { type: String }
});

Timeslot.virtual('id')
	.get(function (){return this._id.toHexString()})