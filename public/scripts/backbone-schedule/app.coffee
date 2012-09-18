#Main Shark Application file

# Require the router here to help route urls
define(['jQuery','Underscore','Backbone', 'router'], ($, _, Backbone, Router) ->
	
	#All the router's initialize function
	initialize = () ->
    Router.initialize()

  #Return an object with the intialize method
  initialize: initialize
)