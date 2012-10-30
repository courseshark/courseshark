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
			'click #search-send': 'preformSearch'
			'keyup #search-field': 'searchTypeing'

		
		focusOnSearch: ->
			($ '#search-field').focus()

		showResultsFrame: ->
			Shark.showingResults = true
			($ '#results-frame').toggleClass 'hidden'
			($ '#slide-container').toggleClass('span16').toggleClass('span8')
			($ '#tutorial-frame').addClass 'hidden'

		searchTypeing: (event) ->
			@preformSearch() if event.keyCode == 13

		preformSearch: ->
			@showResultsFrame() if not Shark.showingResults
			Shark.searchResults.search ($ '#search-field')

		slideUpdate: ->
			@$slider = @$el.find('.slider') if not @$slider
			@$sliderTime = @$el.find('.time') if not @$sliderTime
			value = @$slider.slider('values')
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
			@$sliderTime.text minHour + ':' + minMin + ' - ' + maxHour + ':' + maxMin

		render: ->
			@$el.append @filterTemplate()
			# 5-minute increments [0 - 24*60/5 == 0-288]         range starts at 7am - 7pm
			(@$slider = @$el.find('.slider')).slider
				range: true
				min: 72
				max: 276 
				values: [84, 228]
			@slideUpdate()

	filterView
)