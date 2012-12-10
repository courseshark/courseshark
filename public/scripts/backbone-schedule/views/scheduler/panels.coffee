#Incude all the models here, then pass them back into the object
define(['jQuery'
 'Underscore'
 'Backbone'
 'views/shark-view'
 'views/scheduler/result-list'
 'views/scheduler/schedule-sections-list'
 'views/scheduler/filter'
 'views/scheduler/calendar-max'
 'views/scheduler/calendar-mini'
 'views/scheduler/friends-list'
 'text!tmpl/scheduler/panels.ejs'], ($, _, Backbone, SharkView, ResultListView, ScheduleSectionsListView, FilterView, CalendarMaxView, CalendarMiniView, FriendsListView, templateText) ->

	class panelsView extends SharkView

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			## For full height adjustments
			@ticking = false		# Lock var to keep from calling too much
			@$window = $ window # Reference for later calucatons

			# Render call
			@heightAdjust()	# Adjust before we render to save a paint cycle + visual jank
			@render()

			# Resize window listener
			#@resizeLayout = _.debounce(@resizeEvent, 10)
			@$window.on 'resize', @resizeEvent

			Shark.friendsList.on 'showFriendsSchedule', () =>
				@showMaxCal() if not ($ '#slide-container').hasClass 'closed'


		# Renders the actual view from the template
		render: ->
			@$el.html $ @template()

			if Shark.schedule.get('sections').length > 0
				@$el.find('#tutorial-frame').hide()

			@resultsView = new ResultListView( el: (@$el.find '#results-frame')[0] )
			@coursesView = new ScheduleSectionsListView( el: (@$el.find '#courses-frame')[0])
			@filterView = new FilterView( el: (@$el.find '#filter-frame')[0] )
			@friendsView = new FriendsListView( el: (@$el.find '#friends-frame')[0] )
			@maxiCal = new CalendarMaxView( model: Shark.schedule, el: (@$el.find '#max-cal-frame')[0] )
			@miniCal = new CalendarMiniView( model: Shark.schedule, el: (@$el.find '#mini-cal-frame')[0] )

		teardown: ->
			@$window.off 'resize', @resizeEvent
			views = [@resultsView, @coursesView, @filterView, @friendsView, @maxiCal, @miniCal]
			for view in views
				view.teardown?()
			super()

		events:
			'click #slide-panel-button': 'toggleSlidePanel'

		focusOnSearch: ->
			@filterView.focusOnSearch()

		showMaxCal: ->
			Shark.router.navigateAppend 'view', trigger: false, replace: true
			($ '#slide-container').addClass 'closed'
			($ '#slide-panel-button').removeClass 'open'
			($ '#max-cal-frame').removeClass 'hidden'
			($ '#tutorial-frame').addClass 'hidden'

		hideMaxCal: ->
			Shark.router.navigateRemove 'view', trigger: false, replace: true
			($ '#slide-container').removeClass 'closed'
			($ '#slide-panel-button').addClass 'open'
			($ '#max-cal-frame').addClass 'hidden'
			if Shark.schedule.get('sections').length
				($ '#tutorial-frame').addClass 'hidden'
			else
				($ '#tutorial-frame').removeClass 'hidden'

		toggleSlidePanel: ->
			if ($ '#slide-container').hasClass 'closed'
				@hideMaxCal()
			else
				@showMaxCal()
		# Is called every time the window resizes
		resizeEvent: ->
			# If we are already in a loop, dont call rAF
			if not @ticking
				@ticking = true
				requestAnimFrame @heightAdjust
			else
				return

		# Actually readjusts the height of the view
		heightAdjust: ->
			# Window height minus top position of this element
			newHeight = @$window.height() -
									@$el.position().top -
									parseInt(@$el.css('padding-top'),10) -
									parseInt(@$el.css('padding-bottom'),10)
			@$el.height newHeight
			@ticking = false

	# Whatever is returned here will be usable by other modules
	panelsView
)