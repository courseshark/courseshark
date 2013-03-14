define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/privacy/friends-email.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class FriendsEmailSettingsView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html @template emailOnInvite: Shark.session.get('user').get('canEmailFriendRequests')
      @

    events:
      'click .cancel': 'emitClose'
      'click .submit': 'submit'

    emitClose: ->
      @trigger('close')

    submit: ->
      email = @$el.find('#friend_email_yes').is(':checked')
      user = Shark.session.get('user')
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          updateEmailOnInvite:
            email: email
        success: (res) =>
          if res.success
            @emitClose()
            Shark.session.get('user').set('canEmailFriendRequests', email)
          else
            @emitClose()

    teardown: ->
      super()

  FriendsEmailSettingsView
)