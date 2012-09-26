#Incude all the models here, then pass them back into the object
define(['jQuery', 'Underscore', 'Backbone', 'text!/tmpl/app/index.ejs'], ($, _, Backbone, templateText) ->

	class appView extends Backbone.View
		el: $ '#app-container'

		initialize: ->
			_.bindAll @
			
			# Compile the template for future use
			@template = _.template(templateText)

			## For full height adjustments
			@ticking = false		# Lock var to keep from calling too much
			@$window = $ window # Reference for later calucatons
			
			## Render
			@heightAdjust()	# Adjust before we render to save a paint cycle + visual jank
			@render()	# Render out the view

			## Resize window listener
			$(window).resize =>
				@resizeEvent()


		# Renders the actual view from the template
		render: (name='James') ->
			@$el.html @template({name:name})

		
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
	appView
)