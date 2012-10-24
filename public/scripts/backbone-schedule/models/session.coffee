define(['jQuery',
        'Underscore',
        'Backbone'
        'views/auth'], ($,_, Backbone, AuthLoginView) ->

  class Session extends Backbone.Model

    defaults:
      access_token: null
      user_id: null
      user: null

    initalize: ->
      @load()

    authenticated: ->
      !!@get("access_token") and !!@get("user")

    login: ->
      @loginView = new AuthLoginView()


  Session
)
