define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/user'
        'views/auth/login'
        'views/auth/signup'
        'views/auth/forgot-password'
        'views/auth/resolve-duplicate'], ($, _, Backbone, SharkModel, User, AuthLoginView, AuthSignupView, AuthForgotPasswordView, ResolveDuplicateView) ->

  class Session extends SharkModel

    defaults:
      access_token: null
      user_id: null
      user: null

    initalize: -> return

    start: ->
      $.ajax
        url: '/me'
        success: (res) =>
          if res
            @_authorizeFromRes(res)
          else
            @trigger('unauthenticated')

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

    logout: ->
      $.ajax
        url: '/logout'
      @unset 'access_token'
      @unset 'user_id'
      @unset 'user'
      @trigger('unauthenticated')

    login: ->
      @loginView = new AuthLoginView() if not @authenticated()

    loginWithFacebook: (callback=(()->return)) ->
      callback() if @authenticated()
      window.location = "/auth/facebook" if not FB
      FB.login (loginResponse) ->
        if loginResponse.authResponse
          Shark.session.facebookAuth loginResponse.authResponse.accessToken, callback

    signup: ->
      @signupView = new AuthSignupView() if not @authenticated()

    forgotPassword: ->
      @password = new AuthForgotPasswordView() if not @authenticated()

    _authorizeFromRes: (res) ->
      @set 'access_token', res.access_token
      @set 'user_id', res.user_id
      @set 'user', new User(res.user)
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

    doPassword: (email, success=(()->return), fail=(()->return)) ->
      $.ajax
        url: ' /forgot-password'
        data:
          user:
            email: email
        type: 'post'
        success: (res) =>
          if res
            success()
          else
            fail()
        error: =>
          fail()

    doMerge: (model) ->
      $.ajax
        url: '/user/merge'
        data:
          duplicate: model.id
        type: 'post'
        success: (res) =>
          if not res.error
            @._authorizeFromRes res

    resolveDuplicate: (duplicateId, next) ->
      duplicate = new User({_id:duplicateId})
      @resolveDuplicateView = new ResolveDuplicateView(model: duplicate, next: next)
      @resolveDuplicateView.show()

  Session
)
