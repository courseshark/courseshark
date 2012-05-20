var util = require('../lib/utils')

exports = module.exports = function (app){
	mongoose.model('Department', Department);
	app.Department = Department = mongoose.model('Department');
}


Department = new Schema({
		name: { type: String }
	,	abbr: { type: String }
});

Department.virtual('id')
	.get(function (){return this._id.toHexString()})