# Require.js allows us to configure shortcut alias to scripts
# These will be usefull when requiring them later
require.config(
  paths:
    jQuery: '/scripts/libs/jquery/jquery.req'
    Underscore: '/scripts/libs/underscore/underscore.req'
    Backbone: '/scripts/libs/backbone/backbone.req'
)

require(
  [
    'app',
    'order!/scripts/libs/jquery/jquery.req',
    'order!/scripts/libs/underscore/underscore.req',
    'order!/scripts/libs/backbone/backbone.req'
  ], (Shark) ->
      #The "app" dependency is passed in as "App"
      window.Shark = Shark
      Shark.initialize();
)