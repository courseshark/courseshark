define(['jQuery'
				'Underscore'
				'Backbone'
				'models/filter'
				'views/scheduler/filters/slider-filter'], ($,_, Backbone, FilterModel, SliderFilterView) ->

	class TimeFilter extends FilterModel

		defaults:
			name: "Time of Day"
			valueText: '--'
			sliderOptions:
				range: true
				min: 12	# Now using a step of 30 minutes for ease
				max: 46
				values: [14,38] # 7am - 7pm
				animate: 100
			options: ['m','t','w','th','f']
			values: [true, true, true, true, true]

		initialize: ->
			@active = true
			@view = SliderFilterView

		# Update the view with the text version of the values
		updateText: (value) ->
			step = 30
			divisor = 60/step
			minHour = parseInt( (value[0] / divisor) % 24)
			minMin = parseInt( (value[0] - divisor * minHour) * step )
			maxHour = parseInt( (value[1] / divisor) % 24)
			maxMin = parseInt( (value[1] - divisor * maxHour) * step)
			@startMinute = 60 * minHour + minMin
			@endMinute = 60 * maxHour + maxMin

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

			txt = (minHour + ':' + minMin + ' - ' + maxHour + ':' + maxMin)
			@set 'valueText', txt

		# Logic section of the filter
		filter: (section) =>

			# Helper function to convert time to just minutes
			toMinutes = (time) ->
				time.getUTCHours()*60+time.getUTCMinutes()+(time.getUTCSeconds()/60.0)

			return if not section.get 'timeslots'
			# Loops though all timeslots -> day arrays -> days, adding them to the allDays array
			for timeslot in section.get 'timeslots'
				do (timeslot) =>
					startMinutes = toMinutes new Date timeslot.startTime
					endMinutes = toMinutes new Date timeslot.endTime
					return if (startMinutes | endMinutes) is 0
					if startMinutes < @startMinute or endMinutes > @endMinute
						section.set('visible', false)

		viewChange: (values) ->
			@updateText(values)

	TimeFilter
)