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

    # Test for time-conflicts
    conflictsWith: (section) ->
      myTimeslots = @get 'timeslots'
      otherTimeslots = section.get 'timeslots'
      for mySlot in myTimeslots
        for otherSlot in otherTimeslots
          sameDays = (day for day in otherSlot.days when day in mySlot.days)
          # Ensure we have Date objects
          myStart  = new Date mySlot.startTime
          myEnd    = new Date mySlot.endTime
          otherStart = new Date otherSlot.startTime
          otherEnd   = new Date otherSlot.endTime
          if sameDays.length
            mySpan    = [ myStart.getUTCHours()+(myStart.getUTCMinutes()/60.0)
                        , myEnd.getUTCHours()+(myEnd.getUTCMinutes()/60.0)]
            otherSpan = [ otherStart.getUTCHours()+(otherStart.getUTCMinutes()/60.0)
                        , otherEnd.getUTCHours()+(otherEnd.getUTCMinutes()/60.0)]
            # return if we detect collision
            return true if mySpan[0] <= otherSpan[1] and otherSpan[0] <= mySpan[1]
            return true if mySpan[0] is otherSpan[0] or mySpan[1] is otherSpan[1]
      # If we make it here, we didn't find a conflict
      return false
)