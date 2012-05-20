var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('Term', Term);
	app.Term = Term = mongoose.model('Term');
}


Term = new Schema({
		name: { type: String }
	,	season: { type: String }
	,	year: { type: Number }
	,	number: { type: Number, index: true }
	, startDate: { type: Date }
	, endDate: { type: Date }
});

Term.virtual('id')
	.get(function (){return this._id.toHexString()})