(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jQuery', 'Underscore', 'Backbone'], function($, _, Backbone) {
    var appView;
    appView = (function(_super) {

      __extends(appView, _super);

      function appView() {
        return appView.__super__.constructor.apply(this, arguments);
      }

      appView.prototype.el = $('body');

      appView.prototype.initialize = function() {
        _.bindAll(this);
        $('body').append('<h1>Hello World</h1>');
        return console.log("Init");
      };

      return appView;

    })(Backbone.View);
    return appView;
  });

}).call(this);
