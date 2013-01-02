#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/dropdowns/friend-request'
        'views/dropdowns/seatwatcher'
        'text!tmpl/app/nav/dropdowns/notifications.ejs'], ($, _, Backbone, SharkView, FriendRequestView, SeatWatcherView, templateText) ->

  class NotificationsDropdownView extends SharkView

    initialize: ->
      _.bindAll @

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').appendTo 'body'
      else
        @$el = $('#dropdown-view')

      Shark.friendInvites.on 'add', @render
      Shark.friendInvites.on 'reset', @render
      Shark.friendInvites.on 'remove', @render

      Shark.notifications.on 'add', @render
      Shark.notifications.on 'reset', @render
      Shark.notifications.on 'remove', @render

      @inviteViews = []

      @template = _.template templateText
      @render()


    render: ->
      @$el.hide().css(right: '160px').html @template()

      @renderNotifications()

      @renderFriends()

      @show()


    renderNotifications: ->
      if @inviteViews
        for view in @inviteViews
          view.teardown?()
      @inviteViews = []

      if Shark.notifications.length
        $list = @$el.find('.notification-list').empty().removeClass('empty')
        Shark.notifications.each (notification) =>
          view = new SeatWatcherView model: notification
          @inviteViews.push view
          $list.append view.el


    renderFriends: ->
      if @notificationViews
        for view in @notificationViews
          view.teardown?()
      @notificationViews = []

      if Shark.friendInvites.length
        $list = @$el.find('.request-list').empty().removeClass('empty')
        Shark.friendInvites.each (user) =>
          view = new FriendRequestView(model: user)
          @notificationViews.push(view)
          $list.append view.el


    events:
      'click .close' : 'hide'

    show: ->
      @$el.show()
      $('#app-container').on 'click', @hide

    hide: ->
      $('#app-container').off 'click', @hide
      @teardown()

    teardown: ->
      if @inviteViews
        for view in @inviteViews
          view.teardown?()
      if @notificationViews
        for view in @notificationViews
          view.teardown?()
      super()

  # Whatever is returned here will be usable by other modules
  NotificationsDropdownView
)