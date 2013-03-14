define(['jQuery',
        'Underscore',
        'Backbone'
        'views/shark-view'
        'text!tmpl/auth/forgot-password.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class ForgotPasswordView extends SharkView

    tagName: "div"

    className: "modal"

    events:
      "keypress .forgot-form-input-email": "checkSubmit"
      "click .remembered-password": "switchToLogin"
      "click .rememeber-needs-account": "switchToSignup"
      "click .forgot-form-submit": "recover"
      "click .close": "close"
      "click .login-via-facebook": "loginWithFacebook"

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      (@$el.html @template()).appendTo('body')
      @$email = @$el.find('.forgot-form-input-email')
      @$error = @$el.find('.forgot-error').hide()
      @render()

    render: ->
      @show()

    show: ->
      @$el.modal 'show'

    close: ->
      @$el.modal 'hide'
      @$el.on 'hidden', ()=>
        @teardown()

    checkSubmit: (e) ->
      if e.keyCode is 13
        @recover()

    recover: ->
      email = @$email.val()
      @$error.hide()
      if email
        Shark.session.doPassword email, @switchToLogin, @forgotFailed
      else
        @$error.html('Must enter Email').slideToggle()

    loginWithFacebook: ->
      Shark.session.loginWithFacebook @close

    switchToLogin: ->
      @close()
      Shark.session.login()

    switchToSignup: ->
      @close()
      Shark.session.signup()

    forgotFailed: ->
      @$error.hide().html('No user account found.').slideToggle()


  ForgotPasswordView
)