define(['jQuery',
	'Underscore',
	'Backbone',
	'text!/tmpl/app/filter.ejs'], ($, _, Backbone, filterTemplate) ->

	class filterView extends Backbone.View

		initialize: ->
			_.bindAll @

			@filterTemplate = _.template(filterTemplate)

			@render();

		events:
			'slide .slider': 'slideUpdate'

		slideUpdate: ->
			$slider = @$el.find('.slider')
			value = $slider.slider('values')
			console.log 'yay jquery-ui is working!', value
			# @$el.formatTime(value)
			minHour = parseInt( (value[0] / 12) % 24)
			minMin = parseInt( (value[0] - 12 * minHour) * 5 )
			maxHour = parseInt( (value[1] / 12) % 24)
			maxMin = parseInt( (value[1] - 12 * maxHour) * 5)
			if minMin < 10
				minMin = '0' + minMin
			if maxMin < 10
				maxMin = '0' + maxMin
			if minHour < 12
				minMin = minMin + ' am'
			else
				minHour = minHour - 12
				minMin = minMin + ' pm'
			if maxHour < 12
				if maxHour == 0
					maxHour = 12
				maxMin = maxMin + ' am'
			else
				maxHour = maxHour - 12
				maxMin = maxMin + ' pm'
			if minHour == 0
				minHour = 12
			if maxHour == 0
				maxHour = 12
			@$el.find('.time').text minHour + ':' + minMin + ' - ' + maxHour + ':' + maxMin

		formatTime: (values) ->
			minHour = parseInt( (value[0] / 12) % 24)
			minMin = parseInt( (value[0] - 12 * minHour) * 5 )
			maxHour = parseInt( (value[1] / 12) % 24)
			maxMin = parseInt( (value[1] - 12 * maxHour) * 5)
			if minMin < 10
				minMin = '0' + minMin
			if maxMin < 10
				maxMin = '0' + maxMin
			if minHour < 12
				minMin = minMin + ' am'
			else
				minHour = minHour - 12
				minMin = minMin + ' pm'
			if maxHour < 12
				if maxHour == 0
					maxHour = 12
				maxMin = maxMin + ' am'
			else
				maxHour = maxHour - 12
				maxMin = maxMin + ' pm'
			if minHour == 0
				minHour = 12
			if maxHour == 0
				maxHour = 12
			@el.find('.time').text minHour + ':' + minMin + ' - ' + maxHour + ':' + maxMin

		render: ->
			@$el.append @filterTemplate()
			# 5-minute increments [0 - 24*60/5 == 0-288]         range starts at 7am - 7pm
			@$el.find('.slider').slider
				range: true
				min: 0
				max: 288 
				values: [84, 228]

	filterView
)