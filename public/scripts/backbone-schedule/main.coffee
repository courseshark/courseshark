# Require.js allows us to configure shortcut alias to scripts
# These will be usefull when requiring them later
require.config(
  paths:
    jQuery: '/scripts/lib/jquery/jquery.req'
    Underscore: '/scripts/lib/underscore/underscore.req'
    Backbone: '/scripts/lib/backbone/backbone.req'
    Bootstrap: '/scripts/lib/bootstrap/bootstrap.req'

  shim:
    jQuery:
      deps: []
      exports: 'jQuery'
    Underscore:
      deps: ['jQuery']
      exports: '_'
    Backbone:
      deps: ['jQuery', 'Underscore']
      exports: 'Backbone'
    Bootstrap:
      deps: ['jQuery']
      exports: 'Bootstrap'
)

require(
  [
    'app',
    'jQuery',
    'Underscore',
    'Backbone',
    'Bootstrap'
  ], (Shark) ->
      #The "app" dependency is passed in as "App"
      window.Shark = Shark
      Shark.router = Shark.initialize()
)