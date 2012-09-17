(function() {

  require.config({
    paths: {
      jQuery: '/scripts/libs/jquery/jquery.req',
      Underscore: '/scripts/libs/underscore/underscore.req',
      Backbone: '/scripts/libs/backbone/backbone.req'
    }
  });

  require(['app', 'order!/scripts/libs/jquery/jquery.req', 'order!/scripts/libs/underscore/underscore.req', 'order!/scripts/libs/backbone/backbone.req'], function(Shark) {
    window.Shark = Shark;
    return Shark.initialize();
  });

}).call(this);
