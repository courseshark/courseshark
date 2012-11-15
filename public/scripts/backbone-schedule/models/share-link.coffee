define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class ShareLink extends SharkModel

    idAttribute: "hash"

    urlRoot: '/links'

    initialize: ->
      _.bindAll @

  ShareLink
)