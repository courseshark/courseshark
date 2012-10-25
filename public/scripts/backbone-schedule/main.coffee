# Require.js allows us to configure shortcut alias to scripts
# These will be usefull when requiring them later
require.config(
  paths:
    jQuery: '/scripts/lib/jquery/jquery.req'
    Underscore: '/scripts/lib/underscore/underscore.req'
    Backbone: '/scripts/lib/backbone/backbone.req'
    jQueryUI: '/scripts/lib/jquery/jquery-ui.req'
    jQueryCookie: '/scripts/lib/jquery/jquery-cookie.req'
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
    jQueryUI:
      deps: ['jQuery']
      exports: 'jQueryUI'
    jQueryCookie:
      deps: ['jQuery']
      exports: 'jQueryCookie'
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
    'jQueryUI',
    'jQueryCookie'
    'Bootstrap'
  ], (Shark) ->
      #The "app" dependency is passed in as "Shark"
      window.Shark = Shark
      Shark.router = Shark.initialize()
)