#Incude all the models here, then pass them back into the object
define(['jQuery',
 'Underscore',
 'Backbone',
 'text!/tmpl/app/panels.ejs',
 'views/result-list',
 'views/schedule-sections-list',
 'views/filter',
 'views/calendar-max',
 'views/calendar-mini',
 'views/friends-list'], ($, _, Backbone, templateText, ResultListView, ScheduleSectionsListView, FilterView, CalendarMaxView, CalendarMiniView, FriendsListView) ->

	class panelsView extends Backbone.View

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)

			## For full height adjustments
			@ticking = false		# Lock var to keep from calling too much
			@$window = $ window # Reference for later calucatons

			# Render call
			@heightAdjust()	# Adjust before we render to save a paint cycle + visual jank
			@render();

			# Resize window listener
			$(window).resize =>
				@resizeEvent()


		# Renders the actual view from the template
		render: ->
			@$el.html $ @template()
			@resultsView = new ResultListView( el: (@$el.find '#results-frame')[0] )
			@coursesView = new ScheduleSectionsListView( el: (@$el.find '#courses-frame')[0])
			@filterView = new FilterView( el: (@$el.find '#filter-frame')[0] )
			@friendsView = new FriendsListView( el: (@$el.find '#friends-frame')[0] )
			@maxiCal = new CalendarMaxView( model: Shark.schedule, el: (@$el.find '#max-cal-frame')[0] )
			@miniCal = new CalendarMiniView( model: Shark.schedule, el: (@$el.find '#mini-cal-frame')[0] )


		events:
			'click #slide-panel-button': 'toggleSlidePanel'

		focusOnSearch: ->
			@filterView.focusOnSearch()

		showMaxCal: ->
			Shark.showingResults = true
			($ '#results-frame').toggleClass 'hidden'
			($ '#slide-container').toggleClass('span16').toggleClass('span8')
			($ '#tutorial-frame').addClass 'hidden'
			@toggleSlidePanel()

		toggleSlidePanel: ->
			return if ($ '#results-frame').hasClass 'hidden'
			($ '#slide-panel-button').toggleClass 'open'
			($ '#slide-panel').toggleClass 'closed'
			($ '#max-cal-frame').removeClass 'hidden'


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