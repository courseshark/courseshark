#Incude all the models here, then pass them back into the object
define(['jQuery',
	'Underscore',
	'Backbone',
	'text!tmpl/scheduler/schedule/calendar-max-section.ejs'
	'text!tmpl/scheduler/schedule/calendar-popover-content.ejs'], ($, _, Backbone, templateText, popoverTemplate) ->

	class CalendarMaxSection extends Backbone.View

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)
			@popoverTemplate = _.template(popoverTemplate)

			@$els = []

			# Render call
			@render()

		# Renders the actual view from the template
		render: ->

			_.each @model.get('timeslots'), (slot) =>
					slot.startTime = new Date slot.startTime
					slot.endTime = new Date slot.endTime
					_.each slot.days, (day) =>
						scale = 42.0
						offset = 3.0
						height_offset = -10.0
						top_offset = (slot.startTime.getUTCHours() - 6 + (slot.startTime.getUTCMinutes()/60.0)) * scale + offset
						height = Math.floor(Math.max(1, (Math.abs( slot.endTime.getUTCMinutes() - slot.startTime.getUTCMinutes() )/60.0 + slot.endTime.getUTCHours() - slot.startTime.getUTCHours()) * scale + offset)) + height_offset
						startHourAdjusted = (slot.startTime.getUTCHours()%12 is 0) ? 12 : (slot.startTime.getUTCHours()%12)
						endHourAdjusted = (slot.endTime.getUTCHours()%12 is 0) ? 12 : slot.endTime.getUTCHours()%12

						$el = $ @template
							section: @model.attributes
							color: @model.color()
							slot: slot
							height: height
							top_offset: top_offset
							startHourAdjusted: startHourAdjusted
							endHourAdjusted: startHourAdjusted

						@$els.push $el
						($ '.wk-event-wrapper[data-day="'+day+'"]').append $el

						popover_content = @popoverTemplate
							credits: @model.get('credits')
							section: @model.get('info')
							instructor: @model.get('instructor')
							crn: @model.get('number')
							seats: (@model.get('steatsAvailable') || "0") + "/" + @model.get('seatsTotal')
							time: slot.startTime.toLocaleTimeString() + " - " + slot.endTime.toLocaleTimeString()

						$el.popover
							title: @model.get('name')
							html: true
							content: popover_content
							placement: 'top'
							trigger: 'hover'
							animation: false


		# Remove the section
		remove: ->
			_.each @$els, ($el) ->
				$el.remove()

		setFriend: (isFriend) ->
			if isFriend
				_.each @$els, ($el) ->
					$el.addClass('friend')
			else
				_.each @$els, ($el) ->
					$el.removeClass('friend')

	# Whatever is returned here will be usable by other modules
	CalendarMaxSection
)



