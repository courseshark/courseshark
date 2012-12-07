define(['jQuery',
        'Underscore',
        'Backbone'
        'views/shark-view'
        'text!tmpl/auth/login.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class LoginView extends SharkView

    tagName: "div"

    className: "modal fade"

    events:
      "keypress .login-form-input-password": "checkSubmit"
      "click .login-forgot-password": "switchToForgot"
      "click .login-needs-account": "switchToSignup"
      "click .login-via-facebook": "loginWithFacebook"
      "click .login-form-submit": "login"
      "click .close": "close"

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      (@$el.html @template()).appendTo('body')
      @$email = @$el.find('.login-form-input-email')
      @$password = @$el.find('.login-form-input-password')
      @$error = @$el.find('.login-error').hide()
      @render()

    render: ->
      @show()

    show: ->
      @$el.modal 'show'

    close: ->
      @$el.modal 'hide'
      @$el.on 'hidden', ()=>
        @teardown()

    loginWithFacebook: ->
      Shark.session.loginWithFacebook @close

    checkSubmit: (e) ->
      if e.keyCode is 13
        @login()

    login: ->
      email = @$email.val()
      password = @$password.val()
      @$error.hide()
      if email and password
        Shark.session.doLogin email, password, @close, @loginFailed
      else
        @$error.html('Must enter Email and Password').slideToggle()

    switchToSignup: ->
      @close()
      Shark.session.signup()

    switchToForgot: ->
      @close()
      Shark.session.forgotPassword()

    loginFailed: ->
      @$error.hide().html('Username / Password incorrect').slideToggle()


  LoginView
)