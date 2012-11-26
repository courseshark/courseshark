define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'views/auth'], ($, _, Backbone, SharkModel, AuthLoginView) ->

  class Session extends SharkModel

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
