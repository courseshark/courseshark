#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/app/nav/dropdowns/seatwatcher-notification.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class SeatWatcherNotificationView extends Backbone.View

    className: 'seatwatcher-notification'

    initialize: ->
      _.bindAll @

      @template = _.template templateText
      @render()

    render: ->
      section = @model.get 'section'
      @$el.html @template
        nameWithSection: "#{section.get('name')} (#{section.get('info')})"
        lastUpdated: @model.get 'lastUpdated'
        seats: "#{section.get('seatsAvailable')}/#{section.get('seatsTotal')}"

  # Whatever is returned here will be usable by other modules
  SeatWatcherNotificationView
)