define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/user'
        'views/auth'
        'views/auth/resolve-duplicate'], ($, _, Backbone, SharkModel, User, AuthLoginView, ResolveDuplicateView) ->

  class Session extends SharkModel

    defaults:
      access_token: null
      user_id: null
      user: null

    initalize: ->
      @load()

    authenticated: ->
      !!@get("access_token") and !!@get("user")

    facebookAuth: (accessToken, next=(()->return;)) ->
      $.ajax
        url: '/auth/facebook-from-token'
        data: accessToken: accessToken
        success: (res) =>
          if res.error
            console.error res.error
            return
          if !@authenticated()
            @set 'access_token', res.access_token
            @set 'user_id', res.user_id
            @set 'user', res.user
            @trigger('authenticated')
          if res.duplicate
            @resolveDuplicate res.duplicate, next
          else
            next()

    login: ->
      @loginView = new AuthLoginView()

    resolveDuplicate: (duplicateId, next) ->
      duplicate = new User({_id:duplicateId})
      @resolveDuplicateView = new ResolveDuplicateView(model: duplicate, next: next)
      console.log @resolveDuplicateView
      @resolveDuplicateView.show()

  Session
)
