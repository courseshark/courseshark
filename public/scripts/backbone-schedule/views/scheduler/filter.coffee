define(['jQuery'
	'Underscore'
	'Backbone'
	'views/shark-view'
	'collections/filters'
	'models/filters/seats-filter'
	'models/filters/days-filter'
	'models/filters/time-filter'
	'models/filters/friends-filter'
	'text!tmpl/scheduler/filters/index.ejs'], ($, _, Backbone, SharkView, FilterCollection, SeatsFilter, DaysFilter, TimeFilter, FriendsFilter, filterTemplate) ->

	class filterView extends SharkView

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

			@filterViews = []

			@render()

			# Reference the filter call function globally
			Shark.filterResults = @filterResults

		events:
			'click #search-send': 'preformSearch'
			'keyup #search-field': 'searchTypeing'


		# Filter the current search results
		filterResults: ->
			# Tell the results object we are starting the filter
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
			Shark.showingResults = false
			@$el.append @filterTemplate()
			@$filtersContainer = @$filtersContainer or @$el.find '.advanced-search-filters'
			@filters.each (filter) =>
				view = new filter.view model: filter
				@filterViews.push(view)
				@$filtersContainer.append view.render().el

		teardown: ->
			for view in @filterViews
				view.teardown?()
			super()

	filterView
)