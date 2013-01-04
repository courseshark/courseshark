define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/settings/privacy/friends-email'
        'models/user'
        'text!tmpl/settings/privacy.ejs'], ($, _, Backbone, SharkView, FriendsEmailView, User, templateText) ->


  class PrivacySettingsView extends SharkView

    className: 'row-fluid'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()
      Shark.session.get('user').on 'change:canEmailFriendRequests', @render

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click #edit-friends-email' : 'showEditFriendsEmail'

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


    showEditFriendsEmail: ->
      $el = @$el.find('#edit-friends-email')
      @showEditSubview $el, FriendsEmailView


    teardown: ->
      Shark.session.get('user')?.off 'change:canEmailFriendRequests', @render
      super()

  PrivacySettingsView
)