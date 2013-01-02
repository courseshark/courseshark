define(['jQuery'
        'Underscore'
        'Backbone'
        'models/notification'
        'models/section'], ($, _, Backbone, Notification, Section) ->

  class Notifications extends Backbone.Collection

    url: '/api/notifications'
    model: Notification

    comparator: (notification) ->
      notification.id

  Notifications
)