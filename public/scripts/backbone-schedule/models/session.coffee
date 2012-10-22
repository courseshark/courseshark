define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Session extends Backbone.Model

    defaults:
      access_token: null
      user_id: null

    initalize: ->
      @load()

    authenticated: ->
      Boolean(@get("access_token"))

    save: (auth_hash)->
      $.cookie('user_id', auth_hash.id)
      $.cookie('access_token', auth_hash.access_token)

    load: ->
      @set
        user_id: $.cookie('user_id')
        access_token: $.cookie('access_token')
  Session
)

App.Models.