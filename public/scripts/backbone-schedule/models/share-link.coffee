define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class ShareLink extends Backbone.Model

    idAttribute: "hash"

    urlRoot: '/links'

    initialize: ->
      _.bindAll @

  ShareLink
)