#Incude all the models here, then pass them back into the object
define(['jQuery'
				'Underscore'
				'Backbone'
				'views/main-nav'
				'views/scheduler/nav'
				'views/scheduler/panels'
				'text!tmpl/app/index.ejs'], ($, _, Backbone, MainNavView, NavView, PanelsView, templateText) ->

	class AppView extends Backbone.View
		el: $ '#app-container'

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			## Render
			@render()	# Render out the view


		events:
			'click #tutorial-frame': 'focusOnSearch'


		focusOnSearch: ->
			@panelsView.focusOnSearch()

		# Renders the actual view from the template
		render: ->
			@$el.html $ @template()
			@mainNav = new MainNavView()
			@navView = new NavView( el: (@$el.children '#main-nav')[0] )
			@panelsView = new PanelsView( el: (@$el.children '#main-container')[0] )
			@ # Return self when done



	# Whatever is returned here will be usable by other modules
	AppView
)