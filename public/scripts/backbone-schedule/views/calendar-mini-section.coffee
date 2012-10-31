#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'text!/tmpl/schedule/calendar-mini-section.ejs'], ($, _, Backbone, templateText) ->

  class CalendarMiniSection extends Backbone.View

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      @$els = []

      # Render call
      @render()

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
            minutes: Math.round(slot.startTime.getUTCMinutes()/15)*0.25
            hours: slot.startTime.getUTCHours() - 6
          endTime = 
            minutes: Math.round(slot.endTime.getUTCMinutes()/15)*0.25
            hours: slot.endTime.getUTCHours() - 6

          # Calculate the offset and height 
          topOffset =  startTime.minutes + startTime.hours * scale
          height = ((endTime.hours+endTime.minutes) - (startTime.hours+startTime.minutes)) * scale

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
        $el.remove()

  # Whatever is returned here will be usable by other modules
  CalendarMiniSection
)



