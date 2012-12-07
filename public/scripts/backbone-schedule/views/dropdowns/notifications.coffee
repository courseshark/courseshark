#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/dropdowns/friend-request'
        'text!tmpl/app/nav/dropdowns/notifications.ejs'], ($, _, Backbone, SharkView, FriendRequestView, templateText) ->

  class NotificationsDropdownView extends SharkView

    initialize: ->
      _.bindAll @

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').appendTo 'body'
      else
        @$el = $('#dropdown-view')

      Shark.friendInvites.on 'add', @render
      Shark.friendInvites.on 'remove', @render

      @inviteViews = []

      @template = _.template templateText
      @render()

    render: ->
      @$el.hide().css(right: '160px').html @template()
      $list = @$el.find('.request-list')
      for view in @inviteViews
        view.teardown()
      @inviteViews = []
      finishRender = =>
        @$el
        @show()

      if Shark.friendInvites.length
        finishCallback = _.after(Shark.friendInvites.length, finishRender)
        $list.removeClass('empty').html('')
        Shark.friendInvites.each (user) =>
          view = new FriendRequestView(model: user)
          @inviteViews.push(view)
          $list.append view.el
          finishCallback()
      else
        finishRender()


    events:
      'click .close' : 'hide'

    show: ->
      @$el.show()
      $('#app-container').on 'click', @hide

    hide: ->
      $('#app-container').off 'click', @hide
      @teardown()

    teardown: ->
      for view in @inviteViews
        view.teardown?()
      super()

  # Whatever is returned here will be usable by other modules
  NotificationsDropdownView
)