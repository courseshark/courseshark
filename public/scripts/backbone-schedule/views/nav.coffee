#Incude all the models here, then pass them back into the object
define(['jQuery', 'Underscore', 'Backbone', 'text!/tmpl/app/nav.ejs'], ($, _, Backbone, templateText) ->

	class navView extends Backbone.View

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			# Render call
			@render();

		events:
			'click #save' : 'save'

		save: ->
			console.log 'save clicked -- probably call router'

		# Renders the actual view from the template
		render: ->
			@$el.html @template()

	# Whatever is returned here will be usable by other modules
	navView
)