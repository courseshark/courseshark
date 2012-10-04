(function() {

  define(['jQuery', 'Underscore', 'Backbone', 'router', 'models', 'views', 'collections'], function($, _, Backbone, Router, models, views, collections) {
    var initialize;
    initialize = function() {
      return Router.initialize();
    };
    return {
      initialize: initialize,
      models: models,
      views: views,
      collections: collections
    };
  });

}).call(this);
