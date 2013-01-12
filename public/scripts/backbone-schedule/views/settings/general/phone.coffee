define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general/phone.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class PhoneSettingsView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @render()

    render: ->
      @$el.html $ @template phone: Shark.session.get('user').get('phone')
      @

    events:
      'click .cancel': 'emitClose'
      'click .submit': 'submit'

    emitClose: ->
      @trigger('close')

    submit: ->
      phone = @$el.find('#inputPhone').val().replace(/[^0-9\.\+]+/gi, '')
      user = Shark.session.get('user')
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          updatePhone:
            value: phone
        success: (res) =>
          if res.success
            @emitClose()
            Shark.session.get('user').set('phone', phone)
          else
            @emitClose()

    teardown: ->
      super()

  PhoneSettingsView
)