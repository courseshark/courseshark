#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'views/shark-view'
  'views/dropdowns/account'
  'views/dropdowns/notifications'
  'views/modals/school-picker'
  'text!tmpl/app/nav/main-nav-school.ejs'
  'text!tmpl/app/nav/main-nav-loggedIn.ejs'
  'text!tmpl/app/nav/main-nav-loggedOut.ejs'], ($, _, Backbone, SharkView, AccountDropdownView, NotificationsDropdownView, SchoolPickerView, templateTextSchool, templateTextLoggedIn, templateTextLoggedOut) ->


  class MainNavView extends SharkView

    className: 'navbar navbar-fixed-top'

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @templateLoggedIn = _.template templateTextLoggedIn
      @templateLoggedOut = _.template templateTextLoggedOut
      @schoolInfoTemplate = _.template templateTextSchool
      # Render call
      @render()

      Shark.session.on 'authenticated', ()=>
        @render()

      Shark.session.on 'unauthenticated', ()=>
        @render()

      Shark.friendInvites.on 'reset', ()=>
        @updateNotificationCount()
      Shark.friendInvites.on 'remove', ()=>
        @updateNotificationCount()
      Shark.friendInvites.on 'addComplete', ()=>
        @updateNotificationCount()

      Shark.notifications.on 'add', () =>
        @updateNotificationCount()
      Shark.notifications.on 'remove', () =>
        @updateNotificationCount()

      Shark.on 'setSchool', =>
        @updateSchool()


    events:
      'click #nav-login': 'login'
      'click .brand': 'goHome'
      'click .user-icon': 'showUserMenu'
      'click #menu-notifications': 'showNotifications'
      'click #menu-schedules': 'showScheduler'
      'click .main-nav-school .logo': 'changeSchool'


    # Renders the actual view from the template
    render: ->
      if Shark.session.authenticated()
        @$el.html @templateLoggedIn
          user: Shark.session.get 'user'
          domain: CS.domain
        @$notificationCount = @$el.find('#notification-count')
        @updateNotificationCount()
      else
        @$el.html @templateLoggedOut
          domain: CS.domain
      @updateSchool()


    updateSchool: ->
      $container = @$el.find('.main-nav-school')
      return $container.empty() if not Shark.school.id
      $container.html @schoolInfoTemplate school: Shark.school

    updateNotificationCount: ->
      seatwatchersReady = Shark.notifications.filter (notification) ->
        section = notification.get('section')
        return true if section.get('seatsAvailable') > 0
        if notification.get('waitlist')
          return true if section.get('waitSeatsAvailable') > 0
      notifications = Shark.friendInvites.length + seatwatchersReady.length
      return if not @$notificationCount
      if notifications == 0
        @$notificationCount.hide()
      else
        @$notificationCount.html(notifications).show()

    goHome: ->
      Shark.router.navigate '/home', {trigger: true}

    login: ->
      Shark.session.login()

    showUserMenu: (e) ->
      Shark.dropdown?.hide()
      Shark.dropdown = new AccountDropdownView()
      mixpanel.track 'Show User Menu', Shark.config.asObject({from: 'Nav'})
      e.stopPropagation()

    showNotifications: (e) ->
      Shark.dropdown?.hide()
      Shark.dropdown = new NotificationsDropdownView()
      mixpanel.track 'Check Notifications', Shark.config.asObject({from: 'Nav'})
      e.stopPropagation()

    showScheduler: (e) ->
      Shark.router.navigate '', trigger: true
      mixpanel.track 'Show Scheduler', Shark.config.asObject({from: 'Nav'})

    changeSchool: ->
      mixpanel.track 'Shown School Picker', Shark.config.asObject manual: true
      @picker = new SchoolPickerView next: ()->return

  # Whatever is returned here will be usable by other modules
  MainNavView
)