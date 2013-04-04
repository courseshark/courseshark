var util = require('../lib/utils')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , NotificationFeedbackSchema = require('./notificationFeedback').NotificationFeedbackSchema
  , NotificationSchema

exports.boot = module.exports.boot = function (app){
  mongoose.model('Notification', NotificationSchema);
  app.Notification = Notification = mongoose.model('Notification');
}

NotificationSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' }
  , section: { type: Schema.ObjectId, ref: 'Section' }
  , waitlist: { type: Boolean, 'default': false }
  , email: { type: String }
  , phone: { type: String }
  , history: []
  , sent: { type: Boolean, 'default': false }
  , lastSent: {type: Date}
  , smsInfo: []
  , deleted: { type: Boolean, 'default': false }
  , hidden: { type: Boolean, 'default': false }
  , school: { type: Schema.ObjectId, ref: 'School' }
  , created: { type: Date, 'default': Date.now() }
  , mofidied: { type: Date }
});


NotificationSchema.set('toJSON', { virtuals: true })
NotificationSchema.set('toObject', { virtuals: true })


NotificationSchema.virtual('id')
  .get(function (){return this._id.toHexString()})

NotificationSchema.pre('save', function(next){
  this.modified = new Date();
  next();
})

NotificationSchema.virtual('cancelLink')
  .get(function (){
    var u = typeof this.user['_id'] !== 'undefined' ? this.user._id : this.user
      , s = typeof this.section['_id'] !== 'undefined' ? this.section._id : this.section
    return '/notification/cancel/'+u+'/'+this.id+'/'+s
  })
NotificationSchema.virtual('reactivateLink')
  .get(function (){
    var u = typeof this.user['_id'] !== 'undefined' ? this.user._id : this.user
      , s = typeof this.section['_id'] !== 'undefined' ? this.section._id : this.section
    return '/notification/reactivate/'+u+'/'+this.id+'/'+s
  })
NotificationSchema.virtual('deleteLink')
  .get(function (){
    var u = typeof this.user['_id'] !== 'undefined' ? this.user._id : this.user
      , s = typeof this.section['_id'] !== 'undefined' ? this.section._id : this.section
    return '/notification/remove/'+u+'/'+this.id+'/'+s
  })

NotificationSchema.virtual('lastUpdated')
  .get(function (){
    var modified = this.modified
      , created  = this._id.getTimestamp()
      , lastSent = this.lastSend
      , lastUpdated = modified || lastSent || created
      , _date = require('underscore.date')
    return _date(lastUpdated.getTime()).fromNow()
  })



exports.NotificationSchema = module.exports.NotificationSchema = NotificationSchema
