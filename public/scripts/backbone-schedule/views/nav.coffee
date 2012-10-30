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
			'click #save-button' : 'save'
			'click #load-button' : 'load'
			'click #new-button' : 'new'
			'click #print-button' : 'print'
			'click #link-button' : 'link'
			'click #ical-button' : 'ical'

		save: ->
			console.log 'save clicked -- probably call router'

		load: ->
			console.log 'load clicked'

		new: ->
			console.log 'new clicked'
			@$el.find('#new').modal('show');
			console.log Shark.terms
			console.log @$el.find('.select-term')

		print: ->
			console.log 'print clicked'

		link: ->
			console.log 'share link clicked'

		ical: ->
			console.log 'ical clicked'


		# Renders the actual view from the template
		render: ->
			@$el.html @template()

	# Whatever is returned here will be usable by other modules
	navView
)