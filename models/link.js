var util = require('../lib/utils')
  , url = require('url')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , LinkSchema

exports.boot = module.exports.boot = function (app){
  mongoose.model('Link', LinkSchema);
  app.Link = Link = mongoose.model('Link');
}

exports.LinkSchema = module.exports.LinkSchema = LinkSchema

LinkSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' }
  , to: { type: String }
  , hash: { type: String }
  , visits: { type: Number, 'default': 0 }
  , referals: { type: Number, 'default': 0}
  , createdOn: { type: Date, 'default': Date.now() }
});

LinkSchema.virtual('id')
  .get(function (){return this._id.toHexString()})

LinkSchema.method('toString', function (){
    var p = url.parse(this.to)
    if ( ! p.search || p.search === '' ){
      return this.to+'?lr='+this.hash
    }else{
      return this.to+'&lr='+this.hash
    }
  })
