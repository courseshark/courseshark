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
			@$el.find('#save').modal('show');
			console.log 'save clicked -- probably call router'

		load: ->
			# TODO: uncomment this
			# return Shark.session.authorize() if !Shark.session.authenticated()
			@$el.find('#load').modal('show');
			console.log 'logged in can save'

		new: ->
			console.log 'new clicked'
			@$el.find('#new').modal('show');

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