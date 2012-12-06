#Incude all the models here, then pass them back into the object
define(['jQuery'
				'Underscore'
				'Backbone'
				'views/main-nav'
				'views/scheduler'
				'views/settings'], ($, _, Backbone, MainNavView, SchedulerView, SettingsView) ->

	class AppView extends Backbone.View
		el: $ '#app-container'

		initialize: ->
			_.bindAll @

			@mainNav = new MainNavView()

			@$viewContainer = $('<div id="view-container"></div>').appendTo @$el


			## Render
			@render()	# Render out the view

		# Renders the actual view from the template
		render: ->
			@$el.prepend @mainNav.$el

		show: (view) ->
			if view != @showing
				@showing = view
				if view is 'scheduler'
					@$viewContainer.empty()
					Shark.view = @view = new SchedulerView( el: @$viewContainer )
				else if view is 'settings'
					@$viewContainer.empty()
					Shark.view = @view = new SettingsView ( el: @$viewContainer )

	# Whatever is returned here will be usable by other modules
	AppView
)