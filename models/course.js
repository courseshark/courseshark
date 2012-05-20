var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('Course', Course);
	app.Course = Course = mongoose.model('Course');
}


Course = new Schema({
		name: { type: String }
	,	term: { type: Schema.ObjectId, ref: 'Term' }
	,	department: { type: Schema.ObjectId, ref: 'Department' }
	,	number: { type: Number, index: true }
});

Course.virtual('id')
	.get(function (){return this._id.toHexString()})