define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Session extends Backbone.Model

    defaults:
      access_token: null
      user_id: null
      user: null

    initalize: ->
      @load()

    authenticated: ->
      !!@get("access_token") and !!@get("user")


  Session
)
