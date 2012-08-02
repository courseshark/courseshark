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
	,	abbr: { type: String, index: true }
	,	state: { type: String }
	,	city: { type: String }
	, zip: { type: String }
	,	terms: [{ type: Schema.ObjectId, ref: 'Term' }]
	,	currentTerm: { type: Schema.ObjectId, ref: 'Term' }
	,	enabled: { type: Boolean, 'default': false, index: true }
	, waitlist: { type: Boolean, 'default': false }
	, notifications: { type: Boolean, 'default': false }
	, notificationCron: { type: String, 'default': '0 */15 * * * *' }
	,	created: { type: Date, 'default': Date.now }
	,	modified: { type: Date, 'default': Date.now }
});

SchoolSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

SchoolSchema.method('addTerm', function(term){
	School.update({_id: this._id}, {$addToSet:{terms:term._id}}).exec(function(err, num){
		if ( err ) { console.log(err) }
	})
})
