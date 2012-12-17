define(['jQuery'
				'Underscore'
				'Backbone'
				'models/filter'
				'views/scheduler/filters/checkbox-filter'], ($,_, Backbone, FilterModel, CheckBoxFilterView) ->

	class FriendsFilter extends FilterModel

		defaults:
			name: "Friends"
			horizontal: false
			options: ['friends','no friends']
			values: [true, true]

		initialize: ->
			@active = false
			@view = CheckBoxFilterView


		# Logic section of the filter
		filter: (section) =>
			# Quickreference attributes
			values = @.get 'values'

			hasFriends = !!(Shark.sectionFriends[section.id])
			# Remove classes without friends
			if hasFriends and not values[0]
				section.set 'visible', false
				return
			# Only classes with friends
			if not hasFriends and not values[1]
				section.set 'visible', false
				return

		viewChange: (values) ->
			@active = false in values
			@.set 'values', values

	FriendsFilter
)