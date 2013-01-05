define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/privacy/recruiters.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class RecruiterShareView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html @template shareWithRecruiters: Shark.session.get('user').get('shareWithRecruiters')
      @

    events:
      'click .cancel': 'emitClose'
      'click .submit': 'submit'

    emitClose: ->
      @trigger('close')

    submit: ->
      value = @$el.find('#shareWithRecruiters').is(':checked')
      user = Shark.session.get('user')
      $.ajax
        url: '/api/user/'+user.id
        type: 'post'
        data:
          updateShareWithRecruiters:
            value: value
        success: (res) =>
          if res.success
            @emitClose()
            Shark.session.get('user').set('shareWithRecruiters', value)
          else
            @emitClose()

    teardown: ->
      super()

  RecruiterShareView
)