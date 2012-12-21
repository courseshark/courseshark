define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class Section extends SharkModel

    idAttribute: "_id"

    defaults:
      visible: true
      seatsAvailable: '--'
      seatsTotal: '--'
      instructor: "No Instructor Specified"
      number: 0

    initialize: ->
      Shark.sockets?.seats?.on 'result', (res) =>
        return if res.id isnt @.id
        for prop, val of res
          @set(prop, val) if prop isnt 'id'
        @trigger 'seatsUpdated'
        console.log 'updated seats from socket'

    __rnd: (seed = Date.now()) ->
      ((seed*9301+49297) % 263212) / (263212.0)

    description: =>
      @.get('description') || @.get('courseDescription') || "No description available"

    color: (opacity=1) ->
      number=(@.get 'number')
      h = (@__rnd(number)*0x1000000<<0).toString(16)
      hex = (new Array(7-h.length)).join("0")+h
      red = parseInt(hex[0..1], 16)
      green = parseInt(hex[2..3], 16)
      blue = parseInt(hex[4..5], 16)
      'rgba('+red+','+green+','+blue+','+opacity+')'

)