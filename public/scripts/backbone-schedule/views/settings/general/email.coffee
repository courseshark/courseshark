define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general/email.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


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

    emitClose: ->
      @trigger('close')

    submit: ->
      email = @$el.find('#inputEmail').val()
      user = Shark.session.get('user')
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          updateEmail:
            email: email
        success: (res) =>
          if res.success
            @emitClose()
            Shark.session.get('user').set('email', email)
          else
            @emitClose()

    teardown: ->
      super()

  EmailSettingsView
)