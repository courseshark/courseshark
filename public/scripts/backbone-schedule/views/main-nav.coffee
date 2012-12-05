#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'views/dropdowns/account'
  'views/dropdowns/notifications'
  'text!tmpl/app/nav/main-nav-loggedIn.ejs'
  'text!tmpl/app/nav/main-nav-loggedOut.ejs'], ($, _, Backbone, AccountDropdownView, NotificationsDropdownView, templateTextLoggedIn, templateTextLoggedOut) ->


  class MainNavView extends Backbone.View

    className: 'navbar navbar-fixed-top'

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @templateLoggedIn = _.template(templateTextLoggedIn)
      @templateLoggedOut = _.template(templateTextLoggedOut)

      @friendInvitesCount = 0
      # Render call
      @render()

      Shark.session.on 'authenticated', ()=>
        @$el.html @templateLoggedIn
          user: Shark.session.get 'user'
          domain: CS.domain
        @$notificationCount = $ '#notification-count'
        @updateFriendNotifications()

      Shark.session.on 'unauthenticated', ()=>
        @$el.html @templateLoggedOut
          domain: CS.domain

      Shark.friendInvites.on 'remove', ()=>
        @updateFriendInvitesMarker()
      Shark.friendInvites.on 'add', ()=>
        @updateFriendInvitesMarker()

    events:
      'click #nav-login': 'login'
      'click .user-icon': 'showUserMenu'
      'click #menu-notifications': 'showNotifications'

    # Renders the actual view from the template
    render: ->
      if Shark.session.authenticated()
        @$el.html @templateLoggedIn
          user: Shark.session.get 'user'
          domain: CS.domain
      else
        @$el.html @templateLoggedOut
          domain: CS.domain


    updateNotificationCount: ->
      notifications = @friendInvitesCount;
      return if not @$notificationCount
      if notifications == 0
        @$notificationCount.hide()
      else
        @$notificationCount.html(@friendInvitesCount).show()

    login: ->
      Shark.session.login()

    showUserMenu: (e) ->
      Shark.dropdown?.hide()
      Shark.dropdown = new AccountDropdownView()
      e.stopPropagation()

    showNotifications: (e) ->
      Shark.dropdown?.hide()
      Shark.dropdown = new NotificationsDropdownView()
      e.stopPropagation()

    updateFriendNotifications: ->
      return if not Shark.session.authenticated()
      Shark.friendInvites.fetch
        success: () =>
          @updateFriendInvitesMarker()

    updateFriendInvitesMarker: ->
      @friendInvitesCount = Shark.friendInvites.length
      @updateNotificationCount()

  # Whatever is returned here will be usable by other modules
  MainNavView
)