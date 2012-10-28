#Incude all the models here, then pass them back into the object
define(['jQuery',
 'Underscore',
  'Backbone',
   'text!/tmpl/app/panels.ejs',
    'views/result-list',
     'views/schedule-sections-list',
      'views/filter'], ($, _, Backbone, templateText, ResultListView, ScheduleSectionsListView, filterView) ->

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
			@coursesView = new ScheduleSectionsListView( el: (@$el.find '#schedule-frame')[0] , collection: Shark.schedule.get("sections"))
			@filterView = new filterView( el: (@$el.find '#filter-frame')[0] )


		events:
			'click #slide-panel-button': 'toggleSlidePanel'

		focusOnSearch: ->
			@filterView.focusOnSearch()

		toggleSlidePanel: ->
			return if ( $ '#results-frame').hasClass 'hidden'
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