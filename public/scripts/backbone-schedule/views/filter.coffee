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
		events:
			'slide .slider': 'slideUpdate'

		slideUpdate: ->
			$slider = @$el.find('.slider')
			value = $slider.slider('values')
			console.log 'yay jquery-ui is working!', value

		render: ->
			params =
				search: 'Find a class'
				adv_search: 'Advanced search'
			@$el.append @filterTemplate(params)
			# 5-minute increments [0 - 24*60/5 == 0-288]         range starts at 7am - 7pm
			@$el.find('.slider').slider( range: true, max: 288, min: 0, values: [84, 228]);

	filterView
)