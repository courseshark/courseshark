define(['jQuery',
	'Underscore',
	'Backbone',
	'text!/tmpl/modals/new.ejs'], ($, _, Backbone, newTemplate) ->

	class NewView extends Backbone.View

		initialize: ->
			_.bindAll @
			@newTemplate = _.template(newTemplate)
			@render()

		events:
			'click #do-new' : 'new'

		new: ->
			console.log 'blah'

		render: ->
			@$el.html @newTemplate()

	NewView
)