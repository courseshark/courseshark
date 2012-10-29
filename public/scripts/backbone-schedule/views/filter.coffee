define(['jQuery',
	'Underscore',
	'Backbone',
	'collections/filters',
	'models/filters/seats-filter',
	'models/filters/days-filter',
	'models/filters/time-filter',
	'models/filters/friends-filter',
	'text!/tmpl/app/filter.ejs'], ($, _, Backbone, FilterCollection, SeatsFilter, DaysFilter, TimeFilter, FriendsFilter, filterTemplate) ->

	class filterView extends Backbone.View

		initialize: ->
			_.bindAll @

			@filterTemplate = _.template(filterTemplate)

			@filters = new FilterCollection()
			@filters.add new SeatsFilter()
			@filters.add new DaysFilter()
			@filters.add new TimeFilter()
			@filters.add new FriendsFilter()

			@filters.bind 'change', () =>
				@filterResults()

			@render();

			# Reference the filter call function globally
			Shark.filterResults = @filterResults

		events:
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

		render: ->
			@$el.append @filterTemplate()
			@$filtersContainer = @$el.find '.advanced-search-filters'
			@filters.each (filter) =>
				@$filtersContainer.append (new filter.view model: filter).render().el

	filterView
)