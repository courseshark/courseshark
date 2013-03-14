var util = require('../lib/utils')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , SectionSchema
  , TimeslotSchema = require('./timeslot').TimeslotSchema
  , Course = require('./course')

exports.boot = module.exports.boot = function (app){
  mongoose.model('Section', SectionSchema);
  app.Section = Section = mongoose.model('Section');
}

exports.SectionSchema = module.exports.SectionSchema = SectionSchema

SectionSchema = new Schema({
    cid: { type: String, index: true }
  , number: { type: Number, index: true }
  , info: { type: String }
  , type: { type: String }
  , name: { type: String }
  , description: { type: String }
  , course: { type: Schema.ObjectId, index: true, ref: 'Course' }
  , department: { type: Schema.ObjectId, index: true, ref: 'Department' }
  , term: { type: Schema.ObjectId, index: true, ref: 'Term' }
  , session: {type: String}  // used to denote short / half semester sessions
  , school: { type: Schema.ObjectId, index: true, ref: 'School' }
  , campusSet: [{type: String}]
  , instructor: { type: String }
  , parent: { type: Schema.ObjectId, ref: 'Section' }
  , credits: { type: String }
  , categorySet: [{stype: String}]
  , seatsAvailable: { type: Schema.Types.Mixed }
  , seatsTotal: { type: Schema.Types.Mixed, 'default': 0 }
  , waitSeatsAvailable: { type: Number }
  , waitSeatsTotal: { type: Number }
  , timeslots: []
  , deleted: { type: Boolean, 'default': false }
  , updated: { type: Date, 'default': Date.now }
  , _tokens: [{ type: String, index: true }]
}, {shardkey: {course: 1}});


SectionSchema.virtual('id')
  .get(function (){return this._id.toHexString()})
