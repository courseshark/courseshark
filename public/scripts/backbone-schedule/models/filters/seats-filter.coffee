define(['jQuery',
				'Underscore',
				'Backbone'
				'../../models/filter',
				'../../views/filters/checkbox-filter'], ($,_, Backbone, FilterModel, CheckBoxFilterView) ->

	class SeatsFilter extends FilterModel

		defaults:
			name: "Seats"
			horizontal: false
			options: ['available','waitlist','full']
			values: [true, true, true]

		initialize: ->
			@active = false
			@view = CheckBoxFilterView
			

		# Logic section of the filter
		filter: (section) =>
			# Quickreference attributes
			values = @.get 'values'
			
			seats = section.get 'seatsAvailable'
			waitlist = section.get 'waitlistAvailable'
			# Remove full classes
			if seats <= 0 and not values[2]
				section.set 'visible', false 
				return
			if ( seats > 0 or seats is '--' ) and not values[0]
				section.set 'visible', false
				return
			if seats <= 0 and waitlist > 0 and not values[1]
				section.set 'visible', false
				return
			
		viewChange: (values) ->
			@active = false in values
			@.set 'values', values

	SeatsFilter
)