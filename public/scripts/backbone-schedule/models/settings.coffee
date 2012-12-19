define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class UserSettings extends SharkModel

    urlRoot: '/api/settings'

    initialize: ->
      _.bindAll @

    tempAdd: (options={}) ->
      result = options
      for key,val of @.attributes
        result[key] = val
      result

  UserSettings
)