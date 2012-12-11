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
});

FlipFlopSchema.virtual('id')
  .get(function (){return this._id.toHexString()})

exports.FlipFlopSchema = module.exports.FlipFlopSchema = FlipFlopSchema;
