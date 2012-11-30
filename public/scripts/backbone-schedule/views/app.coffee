#Incude all the models here, then pass them back into the object
define(['jQuery'
				'Underscore'
				'Backbone'
				'views/main-nav'
				'views/scheduler'], ($, _, Backbone, MainNavView, Scheduler) ->

	class AppView extends Backbone.View
		el: $ '#app-container'

		initialize: ->
			_.bindAll @

			@mainNav = new MainNavView()

			## Render
			@render()	# Render out the view

		# Renders the actual view from the template
		render: ->
			@$el.prepend @mainNav.$el

	# Whatever is returned here will be usable by other modules
	AppView
)