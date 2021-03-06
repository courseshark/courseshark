#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'views/shark-view'
  'text!tmpl/scheduler/schedule/calendar-mini-section.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class CalendarMiniSection extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      @$els = []

      # Render call
      @render()


    # Temp is for brushing!
    setTemp: (temp) ->
      @temp = temp
      if @$els.length
        _.each @$els, ($el) ->
          if temp
            $el.addClass('temp')
          else
            $el.removeClass('temp')


    # Renders the actual view from the template
    render: ->

      # Hour scale in px
      scale = 10

      _.each @model.get('timeslots'), (slot) =>
          # Create the time objects from the stored strings
          slot.startTime = new Date slot.startTime
          slot.endTime = new Date slot.endTime

          # Create some easy to reference adjusted time objects
          startTime =
            minutes: Math.round(slot.startTime.getUTCMinutes()/15) * 0.25
            hours: slot.startTime.getUTCHours() - 6
          endTime =
            minutes: Math.round(slot.endTime.getUTCMinutes()/15) * 0.25
            hours: slot.endTime.getUTCHours() - 6


          # Calculate the offset and height
          topOffset    =  (startTime.minutes + startTime.hours ) * scale
          bottomOffset =  (endTime.minutes   + endTime.hours   ) * scale
          height = bottomOffset - topOffset

          # For each day draw this timeslot
          _.each slot.days, (day) =>

            $el = $ @template
              color: @model.color()
              height: height
              topOffset: topOffset
            @$els.push $el
            ($ '#mini-cal-'+day).append $el


    # Remove the section
    remove: ->
      _.each @$els, ($el) ->
        $el.hide()

  # Whatever is returned here will be usable by other modules
  CalendarMiniSection
)



