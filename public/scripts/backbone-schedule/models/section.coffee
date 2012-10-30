define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Section extends Backbone.Model
  	defaults:
  		visible: true
  		seatsAvailable: '--'
  		seatsTotal: '--'

  Section
)