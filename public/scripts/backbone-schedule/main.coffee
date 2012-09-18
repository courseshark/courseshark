# Require.js allows us to configure shortcut alias to scripts
# These will be usefull when requiring them later
require.config(
  paths:
    jQuery: '/scripts/lib/jquery/jquery.req'
    Underscore: '/scripts/lib/underscore/underscore.req'
    Backbone: '/scripts/lib/backbone/backbone.req'

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
)

require(
  [
    'app',
    'jQuery',
    'Underscore',
    'Backbone'
  ], (Shark) ->
      #The "app" dependency is passed in as "App"
      Shark.router = Shark.initialize()
      window.Shark = Shark
)