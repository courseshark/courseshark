var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, TermSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Term', TermSchema);
	app.Term = Term = mongoose.model('Term');
}

exports.boot.TermSchema = module.exports.TermSchema = TermSchema

TermSchema = new Schema({
		name: { type: String }
	,	season: { type: String }
	,	year: { type: Number }
	,	number: { type: Number, index: true }
	, startDate: { type: Date }
	, endDate: { type: Date }
	, school: { type: Schema.ObjectId, ref: 'School', index: true }
});

TermSchema.virtual('id')
	.get(function (){return this._id.toHexString()})