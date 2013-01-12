#Incude all the models here, then pass them back into the object
define(['jQuery'
	'Underscore'
	'Backbone'
	'views/shark-view'
	'text!tmpl/scheduler/schedule/calendar-max-section.ejs'
	'text!tmpl/scheduler/schedule/calendar-popover-content.ejs'], ($, _, Backbone, SharkView, templateText, popoverTemplate) ->

	class CalendarMaxSection extends SharkView

		initialize: ->
			_.bindAll @

			# Compile the template for future use
			@template = _.template(templateText)
			@popoverTemplate = _.template(popoverTemplate)

			@$els = []

			@model.on 'change', =>
				_.each @$els, ($el) ->
					$el.remove()
				@render()

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
						startHourAdjusted = if (slot.startTime.getUTCHours()%12 is 0) then 12 else (slot.startTime.getUTCHours()%12)
						endHourAdjusted = if (slot.endTime.getUTCHours()%12 is 0) then 12 else slot.endTime.getUTCHours()%12

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

						startMinutes = if slot.startTime.getUTCMinutes() < 10 then '0'+slot.startTime.getUTCMinutes() else slot.startTime.getUTCMinutes()
						endMinutes   = if slot.endTime.getUTCMinutes() < 10   then '0'+slot.endTime.getUTCMinutes()   else slot.endTime.getUTCMinutes()

						startTime = "#{startHourAdjusted}:#{startMinutes}"
						endTime   = "#{endHourAdjusted}:#{endMinutes}"
						timespan  = "#{startTime} - #{endTime}"

						popover_content = @popoverTemplate
							credits: @model.get('credits')
							section: @model.get('info')
							instructor: @model.get('instructor')
							crn: @model.get('number')
							seats: (@model.get('seatsAvailable') || "0") + "/" + @model.get('seatsTotal')
							time: timespan
							location: slot.location

						$el.popover
							title: @model.get('name')
							html: true
							content: popover_content
							placement: if slot.startTime.getUTCHours() < 10 then 'bottom' else 'top'
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

		teardown: ->
			_.each @$els, ($el) ->
				$el.remove()
			super()

	# Whatever is returned here will be usable by other modules
	CalendarMaxSection
)



