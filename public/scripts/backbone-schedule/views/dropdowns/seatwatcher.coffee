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
      @$el.html @template notification: @model

  # Whatever is returned here will be usable by other modules
  SeatWatcherNotificationView
)