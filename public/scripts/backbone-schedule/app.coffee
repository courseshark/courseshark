#Main Shark Application file

# Require the router here to help route urls
define(['jQuery','Underscore','Backbone', 'router', 'collections/terms', 'models/school', 'models', 'views', 'collections'], ($, _, Backbone, Router, Terms, School, models, views, collections) ->

	#All the router's initialize function
	initialize = () ->
		Shark.terms = new Terms
		Shark.terms.fetch()
		Shark.school = new School
		Shark.school.fetch()
		Router.initialize @

  #Return an object with the intialize method
	initialize: initialize
	models: models
	views: views
	collections: collections

)