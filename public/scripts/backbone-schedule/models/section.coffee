define(['jQuery',
				'Underscore',
				'Backbone'], ($,_, Backbone) ->

	class Section extends Backbone.Model

    idAttribute: "_id"

		defaults:
			visible: true
			seatsAvailable: '--'
			seatsTotal: '--'

		rnd: (seed = Date.now()) ->
			((seed*9301+49297) % 233280) / (233280.0)

		color: (number = (@get 'number')) ->
			h = (@rnd(number)*0x1000000<<0).toString(16)
			'#' + (new Array(7-h.length)).join("0")+h

	Section
)