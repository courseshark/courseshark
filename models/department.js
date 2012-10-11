var util = require('../lib/utils')
	,	mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, DepartmentSchema

exports.boot = module.exports.boot = function (app){
	mongoose.model('Department', DepartmentSchema);
	app.Department = Department = mongoose.model('Department');
}

DepartmentSchema = new Schema({
		name: { type: String }
	,	abbr: { type: String }
	, school: { type: Schema.ObjectId, ref: 'School' }
	, _terms: []
});

DepartmentSchema.virtual('id')
	.get(function (){return this._id.toHexString()})

exports.DepartmentSchema = module.exports.DepartmentSchema = DepartmentSchema
