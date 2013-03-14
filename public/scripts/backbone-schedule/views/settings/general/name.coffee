define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general/name.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class GeneralSettingsView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click .cancel': 'emitClose'
      'click .submit': 'saveName'

    emitClose: ->
      @trigger('close')

    saveName: ->
      firstName = @$el.find('#inputFirstName').val()
      lastName = @$el.find('#inputLastName').val()
      user = Shark.session.get('user')
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          updateName:
            firstName: firstName
            lastName: lastName
        success: (res) =>
          if res.success
            @emitClose()
            Shark.session.get('user').set('firstName', firstName)
            Shark.session.get('user').set('lastName', lastName)
            Shark.session.get('user').set('name', (firstName + ' ' + lastName).trim() )
          else
            @emitClose()

    teardown: ->
      super()

  GeneralSettingsView
)