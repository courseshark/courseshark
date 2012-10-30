#Incude all the models here, then pass them back into the object
define(['jQuery',
	'Underscore',
	'Backbone',
	'views/modals/save',
	'views/modals/load',
	'text!/tmpl/schedule/calendar-max.ejs'], ($, _, Backbone, SaveView, LoadView, templateText) ->

	class navView extends Backbone.View

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			@model = Shark.schedule

			# Render call
			@render();

		# Renders the actual view from the template
		render: ->
			@$el.html @template({schedule: @model, startHour: 6, endHour: 22})

	# Whatever is returned here will be usable by other modules
	navView
)