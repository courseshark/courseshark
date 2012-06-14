var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, TermSchema = require('./term').TermSchema
	, SchoolSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('School', SchoolSchema);
	app.School = School = mongoose.model('School');
}

exports.SchoolSchema = module.exports.SchoolSchema = SchoolSchema

SchoolSchema = new Schema({
		name: { type: String, index: { unique: true } }
	,	abbr: { type: String }
	,	state: { type: String }
	,	city: { type: String }
	, zip: { type: String }
	,	terms: [TermSchema]
	,	currentTerm: { type: Schema.ObjectId, ref: 'Term' }
	,	enabled: { type: Boolean, 'default': true, index: true }
	, waitlist: { type: Boolean, 'default': false }
	, notifications: { type: Boolean, 'default': true }
	, notificationCron: { type: String, 'default': '0 */15 * * * *' }
	,	created: { type: Date, 'default': Date.now }
	,	modified: { type: Date, 'default': Date.now }
});

SchoolSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

SchoolSchema.method('addTerm', function(term){
	for( var i=0, len=this.terms.length; i<len; i++ ){
		if ( this.terms[i] === term.id ){
			return;
		}
	}
	this.terms.push(term['_id'])
	this.save()
})
