#Incude all the models here, then pass them back into the object
define(['jQuery', 'Underscore', 'Backbone', 'text!/tmpl/app/index.ejs', 'views/nav', 'views/panels'], ($, _, Backbone, templateText, navView, panelsView) ->

	class appView extends Backbone.View
		el: $ '#app-container'

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			## Render
			@render()	# Render out the view



		# Renders the actual view from the template
		render: ->
			@$el.html $ @template()
			@navView = new navView( el: (@$el.children '#main-nav')[0] )
			@panelsView = new panelsView( el: (@$el.children '#main-container')[0] )
			
			#Bindings for outside pieces
			($ '#nav-login').click () ->
				Shark.session.login()



	# Whatever is returned here will be usable by other modules
	appView
)