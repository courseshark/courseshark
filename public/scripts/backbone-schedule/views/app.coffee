#Incude all the models here, then pass them back into the object
define(['jQuery'
				'Underscore'
				'Backbone'
				'views/shark-view'
				'views/main-nav'
				'views/home'
				'views/scheduler'
				'views/notifications'
				'views/settings'], ($, _, Backbone, SharkView, MainNavView, HomeView, SchedulerView, NotificationsView, SettingsView) ->

	class AppView extends SharkView
		el: $ '#app-container'

		initialize: ->
			_.bindAll @

			@mainNav = new MainNavView()

			@render()	# Render out the view

		# Renders the actual view from the template
		render: ->
			@$el.prepend @mainNav.$el

		show: (view) ->
			if view != @showing
				@showing = view
				@view?.teardown?() || @view?.remove()
				if view is 'home'
					Shark.view = @view = new HomeView()
				else if view is 'scheduler'
					$viewContainer = $('<div id="view-container"></div>').appendTo @$el
					Shark.view = @view = new SchedulerView el: $viewContainer
				else if view is 'settings'
					Shark.view = @view = new SettingsView()
				else if view is 'notifications'
					Shark.view = @view = new NotificationsView()
				@$el.append(@view.$el)

		teardown: ->
			@view.teardown()
			@mainNav.teardown()
			super()

	# Whatever is returned here will be usable by other modules
	AppView
)