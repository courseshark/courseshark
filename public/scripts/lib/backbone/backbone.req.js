(function() {

  define(['/scripts/lib/backbone/backbone.js'], function() {
    _.noConflict();
    $.noConflict();
    return Backbone.noConflict();
  });

}).call(this);
