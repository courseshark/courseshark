define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/settings/general/name'
        'views/settings/general/email'
        'views/settings/general/password'
        'views/settings/general/school'
        'models/user'
        'text!tmpl/settings/general.ejs'], ($, _, Backbone, SharkView, NameEditView, EmailEditView, PasswordEditView, SchoolEditView, User, templateText) ->


  class GeneralSettingsView extends SharkView

    className: 'row-fluid'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()
      Shark.session.get('user').bind 'change:name', (user, newName) =>
        $el = @$el.find('#edit-name .setting-item-link .setting-value')
        $el.html newName
      Shark.session.get('user').bind 'change:email', (user, newEmail) =>
        $el = @$el.find('#edit-email .setting-item-link .setting-value')
        $el.html newEmail
      Shark.session.get('user').bind 'setPassword', () =>
        Shark.session.get('user').set('password', true)
        @render()
      Shark.session.get('user').bind 'change:school', () =>
        @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click #edit-name' : 'showEditName'
      'click #edit-email' : 'showEditEmail'
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

    showEditPassword: ->
      $el = @$el.find('#edit-password')
      @showEditSubview $el, PasswordEditView

    showEditSchool: ->
      $el = @$el.find('#edit-school')
      @showEditSubview $el, SchoolEditView

    teardown: ->
      super()

  GeneralSettingsView
)