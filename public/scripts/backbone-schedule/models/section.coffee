define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Section extends Backbone.Model

    idAttribute: "_id"

    defaults:
      visible: true
      seatsAvailable: '--'
      seatsTotal: '--'
      number: 0

    __rnd: (seed = Date.now()) ->
      ((seed*9301+49297) % 263212) / (263212.0)

    color: (number=(@.get 'number')) ->
      h = (@__rnd(number)*0x1000000<<0).toString(16)
      '#' + (new Array(7-h.length)).join("0")+h

  window.s =Section
)