# Require.js allows us to configure shortcut alias to scripts
# These will be usefull when requiring them later
require.config(

  paths:
    jQuery: 'lib/jquery/jquery.req'
    jquery_js: 'lib/jquery/jquery'

    Underscore: 'lib/underscore/underscore.req'
    underscore_js: 'lib/underscore/_'

    Backbone: 'lib/backbone/backbone.req'
    backbone_js: 'lib/backbone/backbone'

    jQueryUI: 'lib/jquery/jquery-ui.req'
    jqueryui_js: 'lib/jquery/jquery-ui'

    jQueryCookie: 'lib/jquery/jquery-cookie.req'
    jquery_cookie_js: 'lib/jquery/jquery-cookie'

    Bootstrap: 'lib/bootstrap/bootstrap.req'
    bootstrap_js: 'lib/bootstrap/bootstrap'

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
  ], (Shark, $) ->
      #The "app" dependency is passed in as "Shark"
      window.Shark = Shark
      $(document).ready ()->
        Shark.initialize()

)