define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class UserSettings extends SharkModel

    urlRoot: '/api/settings'

    initialize: ->
      _.bindAll @

    asObject: (options={}) ->
      # Return this object's parameters with options added in
      result = options
      for key,val of @.attributes
        result[key] = val
      result

    can: (thing) ->
      return !!@.get(thing)

  UserSettings
)