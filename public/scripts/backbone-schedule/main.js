(function() {

  require.config({
    paths: {
      jQuery: '/scripts/lib/jquery/jquery.req',
      Underscore: '/scripts/lib/underscore/underscore.req',
      Backbone: '/scripts/lib/backbone/backbone.req'
    },
    shim: {
      jQuery: {
        deps: [],
        exports: 'jQuery'
      },
      Underscore: {
        deps: ['jQuery'],
        exports: '_'
      },
      Backbone: {
        deps: ['jQuery', 'Underscore'],
        exports: 'Backbone'
      }
    }
  });

  require(['app', 'jQuery', 'Underscore', 'Backbone'], function(Shark) {
    window.Shark = Shark;
    return Shark.router = Shark.initialize();
  });

}).call(this);
