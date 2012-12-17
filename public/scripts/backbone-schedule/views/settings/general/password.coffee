define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general/password.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class EmailSettingsView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click .cancel': 'emitClose'
      'click .submit': 'submit'

    error: (message) ->
      @$el.find('.error').hide().html(message).fadeIn()

    emitClose: ->
      @trigger('close')

    submit: ->
      currentPassword = @$el.find('#inputCurrentPassword').val()
      newPassword = @$el.find('#inputNewPassword').val()
      cnfPassword = @$el.find('#inputConfirmPassword').val()

      user = Shark.session.get('user')

      if user.get('password') and not currentPassword
        @error 'Please enter your current password'
        return
      if newPassword == ''
        @error 'New password cannot be blank'
        return
      if newPassword != cnfPassword
        @error 'Passwords do not match'
        return
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          changePassword:
            current: currentPassword
            password: newPassword
        success: (res) =>
          if res.success
            Shark.session.get('user').trigger('setPassword')
            @emitClose()
          else
            @error res.error

    teardown: ->
      super()

  EmailSettingsView
)