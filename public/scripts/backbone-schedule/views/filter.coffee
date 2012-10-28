define(['jQuery',
	'Underscore',
	'Backbone',
	'collections/filters',
	'models/filters/days-filter',
	'text!/tmpl/app/filter.ejs'], ($, _, Backbone, FilterCollection, DaysFilter, filterTemplate) ->

	class filterView extends Backbone.View

		initialize: ->
			_.bindAll @

			@filterTemplate = _.template(filterTemplate)

			@filters = new FilterCollection()
			@filters.add new DaysFilter()

			@filters.bind 'change', () =>
				@filterResults()

			@render();

			# Reference the filter call function globally
			Shark.filterResults = @filterResults

		events:
			'slide .slider': 'slideUpdate'
			'click #search-send': 'preformSearch'
			'keyup #search-field': 'searchTypeing'


		# Filter the current search results
		filterResults: ->
			# Tell the results object we are startting the filter
			Shark.searchResults.trigger 'filter:start'
			# quick reference to the courses
			courses = Shark.searchResults.get('courses')
			# Reset the visibility of the courses / sections
			courses.map (course) ->
    		course.set('visible', true)
    		course.get('sections').map (section) ->
    			section.set('visible', true)
    	
    	# Apply each filter
    	filter.apply(courses) for filter in @filters.models
    	# Tell the results object we are done with filtering
    	Shark.searchResults.trigger 'filter:complete'



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
			@$filtersContainer = @$el.find '.advanced-search-filters'
			@filters.each (filter) =>
				@$filtersContainer.append (new filter.view model: filter).render().el
			# 5-minute increments [0 - 24*60/5 == 0-288]         range starts at 7am - 7pm
			(@$slider = @$el.find('.slider')).slider
				range: true
				min: 72
				max: 276 
				values: [84, 228]
			@slideUpdate()

	filterView
)