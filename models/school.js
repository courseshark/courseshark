var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('School', School);
	app.School = School = mongoose.model('School');
}


School = new Schema({
		name: { type: String, index: { unique: true } }
	,	abbr: { type: String }
	,	state: { type: String } 
	,	city: { type: String } 
	, 	zip: { type: String }
	,	terms: [{ type: Schema.ObjectId, ref: 'Term' }]
	,	currentTerm: { type: Schema.ObjectId, ref: 'Term' }
	,	enabled: { type: Boolean, default: true, index: true }
	,	created: { type: Date, default: Date.now }
	,	modified: { type: Date, default: Date.now }
});

School.virtual('id')
	.get(function (){return this._id.toHexString()})
