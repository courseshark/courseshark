define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/settings/general/name'
        'views/settings/general/email'
        'views/settings/general/phone'
        'views/settings/general/password'
        'views/settings/general/school'
        'models/user'
        'text!tmpl/settings/general.ejs'], ($, _, Backbone, SharkView, NameEditView, EmailEditView, PhoneEditView, PasswordEditView, SchoolEditView, User, templateText) ->


  class GeneralSettingsView extends SharkView

    className: 'row-fluid'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()
      Shark.session.get('user').on 'change:name', @render
      Shark.session.get('user').on 'change:email', @render
      Shark.session.get('user').on 'change:phone', @render
      Shark.session.get('user').on 'setPassword', @render
      Shark.session.get('user').on 'change:school', @render

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click #edit-name' : 'showEditName'
      'click #edit-email' : 'showEditEmail'
      'click #edit-phone' : 'showEditPhone'
      'click #edit-password' : 'showEditPassword'
      'click #edit-school' : 'showEditSchool'

    closeSubview: ->
      @$link.show()
      @$settingEl.removeClass('open')
      @editView?.teardown()
      @$edit?.hide()
      @editView.off 'close', @closeSubview

    showEditSubview: ($el, View)->
      return if $el.hasClass('open')
      @$settingEl?.removeClass('open')
      $el.addClass('open')
      @$settingEl = $el
      $link = $el.find('.setting-item-link')
      $edit = $el.find('.setting-content')

      @$link?.show()
      @$link = $link.hide()

      @$edit?.empty().hide()
      @$edit = $edit.show()

      @editView?.teardown()
      @editView = new View
      @$edit.html @editView.$el
      @editView.bind 'close', @closeSubview


    showEditName: ->
      $el = @$el.find('#edit-name')
      @showEditSubview $el, NameEditView

    showEditEmail: ->
      $el = @$el.find('#edit-email')
      @showEditSubview $el, EmailEditView

    showEditPhone: ->
      $el = @$el.find('#edit-phone')
      @showEditSubview $el, PhoneEditView

    showEditPassword: ->
      $el = @$el.find('#edit-password')
      @showEditSubview $el, PasswordEditView

    showEditSchool: ->
      $el = @$el.find('#edit-school')
      @showEditSubview $el, SchoolEditView

    teardown: ->
      Shark.session.get('user')?.off 'change:name', @render
      Shark.session.get('user')?.off 'change:email', @render
      Shark.session.get('user')?.off 'change:phone', @render
      Shark.session.get('user')?.off 'setPassword', @render
      Shark.session.get('user')?.off 'change:school', @render
      super()

  GeneralSettingsView
)