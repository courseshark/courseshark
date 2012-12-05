define(['jQuery',
				'Underscore',
				'Backbone'
				'text!tmpl/auth/signup.ejs'], ($, _, Backbone, templateText) ->

	class SignupView extends Backbone.View

		tagName: "div"

		className: "modal fade"

		events:
			"keypress .signup-form-input-password": "checkSubmit"
			"click .login-via-facebook": "loginWithFacebook"
			"click .signup-form-submit": "signup"
			"click .user-has-login": "switchToLogin"
			"click .close": "close"

		initialize: ->
			_.bindAll @
			@template = _.template(templateText)
			(@$el.html @template()).appendTo('body')
			@$email = @$el.find('.signup-form-input-email')
			@$password = @$el.find('.signup-form-input-password')
			@$error = @$el.find('.signup-error').hide()
			@render()

		render: ->
			@show()

		show: ->
			@$el.modal 'show'

		close: ->
			@$el.modal 'hide'

		checkSubmit: (e) ->
			if e.keyCode is 13
				@signup()

		signup: ->
			email = @$email.val()
			password = @$password.val()
			@$error.hide()
			if email and password
				Shark.session.doSignup email, password, @close, @sigupFailed
			else
				@$error.html('Must enter Email and Password').slideToggle()

		switchToLogin: ->
			@close()
			Shark.session.login()

		loginWithFacebook: ->
			Shark.session.loginWithFacebook @close

		sigupFailed: ->
			@$error.hide().html('Account Creation Failed. Please try again').slideToggle()


	SignupView
)