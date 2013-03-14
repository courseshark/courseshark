define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/section'], ($, _, Backbone, SharkModel, Section) ->

  class Notification extends SharkModel

    idAttribute: "_id"
    urlRoot: "/api/notifications"

    parse: (response) ->
      response = response[0] if response.length > 0
      if response.section
        response.section = new Section response.section
      response

  Notification
)
