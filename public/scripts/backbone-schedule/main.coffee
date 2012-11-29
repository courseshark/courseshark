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

    jQueryBase64: 'lib/jquery/jquery-base64.req'
    jquery_base64_js: 'lib/jquery/jquery-base64'

    Bootstrap: 'lib/bootstrap/bootstrap.req'
    bootstrap_js: 'lib/bootstrap/bootstrap'

    dateFormat: 'lib/dateFormat/dateFormat'

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
    jQueryBase64:
      deps: ['jQuery']
      exports: 'jQueryBase64'
    Bootstrap:
      deps: ['jQuery']
      exports: 'Bootstrap'
)

require(
  [
    'app'
    'jQuery'
    'Underscore'
    'Backbone'
    'jQueryUI'
    'jQueryCookie'
    'jQueryBase64'
    'Bootstrap'
  ], (Shark, $) ->
      #The "app" dependency is passed in as "Shark"
      $(document).ready ()->
        new Shark()

)