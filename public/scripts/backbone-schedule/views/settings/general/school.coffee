define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general/school.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class SchoolSettingView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      Shark.schools.fetch
        success: =>
          @render()

    render: ->
      @$el.html $ @template schools: Shark.schools.models, user: Shark.session.get('user')
      @

    events:
      'change #inputSchool': 'changeSchool'
      'click .cancel': 'emitClose'
      'click .submit': 'submit'

    emitClose: ->
      @trigger('close')

    changeSchool: ->
      schoolId = @$el.find('#inputSchool').val()
      if schoolId != Shark.session.get('user').get('school').id
        @$el.find('#school-picker').addClass('warning')
        @$el.find('.warning-message').hide().fadeIn().html 'Changing your school will delete all your previous schedules'
      else
        @$el.find('.warning-message').hide().html ''
        @$el.find('#school-picker').removeClass('warning')

    submit: ->
      schoolId = @$el.find('#inputSchool').val()
      user = Shark.session.get('user')
      if schoolId != Shark.session.get('user').get('school').id
        $.ajax
          url: '/api/user/'+user.id
          type: 'post'
          data:
            changeSchool:
              school: schoolId
          success: (res) =>
            if res.success
              @emitClose()
              Shark.session.get('user').set('school', Shark.schools.get(schoolId))
              Shark.session.reloadUser((()->return), false)
            else
              @emitClose()
      else
        @emitClose()

    teardown: ->
      super()

  SchoolSettingView
)