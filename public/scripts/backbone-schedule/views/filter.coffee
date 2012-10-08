define(['jQuery',
	'Underscore',
	'Backbone',
	'text!/tmpl/app/filter.ejs'], ($, _, Backbone, filterTemplate) ->

	class filterView extends Backbone.View

		initialize: ->
			_.bindAll @

			@filterTemplate = _.template(filterTemplate)

			@render();

		slide: ->
			@$el.find('.slider').slider
					range:	true,
					min:		0,
					max:		24,
					values:	[0, 24]
					slide: (event, ui) ->
						#blah

		render: ->
			params =
				search: 'Find a class'
				adv_search: 'Advanced search'	
			@$el.append @filterTemplate(params)
			@

	filterView
)