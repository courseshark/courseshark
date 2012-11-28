#Main Shark Application file

# Require the router here to help route urls
define(['jQuery'
				'Underscore'
				'Backbone'
				'router'
				'collections/friends'
				'collections/terms'
				'models/school'
				'models'
				'views'
				'collections'], ($, _, Backbone, Router, Friends, Terms, School, models, views, collections) ->

	#All the router's initialize function
	initialize = () ->
		Shark.friends = new Friends()
		if CS.auth.user
			Shark.friends.fetch()
		Shark.terms = new Terms(CS.terms)
		Shark.school = new School(CS.school)
		Shark.term = Shark.terms.get Shark.school.get 'currentTerm'
		Router.initialize @
		window.loadFacebook()

  #Return an object with the intialize method
	initialize: initialize
	models: models
	views: views
	collections: collections

)