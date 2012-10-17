#Incude all the models here, then pass them back into the object
define(['jQuery',
 'Underscore',
  'Backbone',
   'text!/tmpl/app/panels.ejs',
    'views/result-sections-list',
     'views/schedule-sections-list'], ($, _, Backbone, templateText, ResultsSectionsListView, ScheduleSectionsListView) ->

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
			@resultsView = new ResultsSectionsListView( el: (@$el.find '#results-frame')[0] )
			@coursesView = new ScheduleSectionsListView( el: (@$el.find '#schedule-frame')[0] , collection: Shark.schedule.get("sections"))


		events:
			'click #slide-panel-button': 'toggleSlidePanel'
			'click #show-results': 'showResults'


		showResults: ->
			($ '#results-frame').toggleClass 'hidden'
			($ '#slide-container').toggleClass('span16').toggleClass('span8')
			($ '#tutorial-frame').addClass 'hidden'

		toggleSlidePanel: ->
			($ '#slide-panel-button').toggleClass 'open'
			($ '#slide-panel').toggleClass 'closed'
			($ '#max-cal-frame').toggleClass 'hidden'


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