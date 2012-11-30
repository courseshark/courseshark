define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/user'
        'views/auth/login'
        'views/auth/signup'
        'views/auth/resolve-duplicate'], ($, _, Backbone, SharkModel, User, AuthLoginView, AuthSignupView, ResolveDuplicateView) ->

  class Session extends SharkModel

    defaults:
      access_token: null
      user_id: null
      user: null

    initalize: -> return

    start: ->
      for field, val of CS.auth
        @set(field, val)
      @trigger('authenticated') if @authenticated()

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
            @_authorizeFromRes res
          if res.duplicate
            @resolveDuplicate res.duplicate, next
          else
            next()

    login: ->
      @loginView = new AuthLoginView() if not @authenticated()

    signup: ->
      @signupView = new AuthSignupView() if not @authenticated()

    _authorizeFromRes: (res) ->
      @set 'access_token', res.access_token
      @set 'user_id', res.user_id
      @set 'user', res.user
      @trigger('authenticated')

    doLogin: (email, password, success=(()->return), fail=(()->return)) ->
      $.ajax
        url: '/login.json'
        data:
          user:
            email: email
            password: password
        type: 'post'
        success: (res) =>
          if res.success
            @_authorizeFromRes res
            success()
          else
            fail()
        error: =>
          fail()

    doSignup: (email, password, success=(()->return), fail=(()->return)) ->
      $.ajax
        url: '/signup'
        data:
          user:
            email: email
            password: password
        type: 'post'
        success: (res) =>
          if res.success
            @_authorizeFromRes res
            success()
          else
            fail()
        error: =>
          fail()

    resolveDuplicate: (duplicateId, next) ->
      duplicate = new User({_id:duplicateId})
      @resolveDuplicateView = new ResolveDuplicateView(model: duplicate, next: next)
      console.log @resolveDuplicateView
      @resolveDuplicateView.show()

  Session
)
