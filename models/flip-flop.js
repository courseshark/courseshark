var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , FlipFlopSchema

exports.boot = module.exports.boot = function (app){
  mongoose.model('FlipFlop', FlipFlopSchema);
  app.FlipFlop = FlipFlop = mongoose.model('FlipFlop');
}

FlipFlopSchema = new Schema({
    name: { type: String, index: { unique: true } }
  , rules: { type: {} }
  , description: { type: String }
  , offsetPercent: { type: Number }
  , created_by: { type: Schema.ObjectId, ref: 'User' }
  , updated: [{type: Date}]
});

FlipFlopSchema.set('toJSON', { virtuals: true })
FlipFlopSchema.set('toObject', { virtuals: true })

FlipFlopSchema.virtual('id')
  .get(function (){return this._id.toHexString()})

FlipFlopSchema.virtual('created_on')
  .get(function (){return this._id.getTimestamp()})

FlipFlopSchema.virtual('last_updated')
  .get(function (){return this.updated[this.updated.length-1]||this._id.getTimestamp()})

FlipFlopSchema.virtual('rules_words')
  .get(function(){
    return this.rules.map(function(andList){ return "("+andList.join(' AND ')+")"; }).join(" OR ");
  })

exports.FlipFlopSchema = module.exports.FlipFlopSchema = FlipFlopSchema;
