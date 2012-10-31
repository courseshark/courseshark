define(['jQuery',
				'Underscore',
				'Backbone'
				'../../models/filter',
				'../../views/filters/checkbox-filter'], ($,_, Backbone, FilterModel, CheckBoxFilterView) ->

	class DaysFilter extends FilterModel

		defaults:
			name: "Days"
			horizontal: true
			options: ['m','t','w','th','f']
			values: [true, true, true, true, true]

		initialize: ->
			@active = false
			@view = CheckBoxFilterView
			@mapper = 
				monday: 'm'
				tuesday: 't'
				wednesday: 'w'
				thursday: 'th'
				friday: 'f'
		 

		# Logic section of the filter
		filter: (section) =>
			# Quickreference attributes
			values = @.get 'values'
			options = @.get 'options'

			# Build an array of all the days the section meets
			timeslots = section.get 'timeslots'
			allDays = []

			# Add the day into the list if its not there already
			addDayToList = (day, list) =>
				dayIndex = options.indexOf(@mapper[day])
				if dayIndex not in list
					list.push(dayIndex)
			
			# Loops though all timeslots -> day arrays -> days, adding them to the allDays array
			(addDayToList(day,allDays) for day in days) for days in (timeslot.days for timeslot in timeslots)
			
			# compare this array with the checked values
			section.set 'visible', false if true in (!values[dayIndex] for dayIndex in allDays)
			
		viewChange: (values) ->
			@active = false in values
			@.set 'values', values

	DaysFilter
)