define(['jQuery',
	'Underscore',
	'Backbone',
	'text!/tmpl/app/filter.ejs'], ($, _, Backbone, filterTemplate) ->

	class filterView extends Backbone.View

		initialize: ->
			_.bindAll @

			@filterTemplate = _.template(filterTemplate)

			@render();

		render: ->
			params =
				search: 'Find a class'
				adv_search: 'Advanced search'
			@$el.append @filterTemplate(params)
			@

	filterView
)