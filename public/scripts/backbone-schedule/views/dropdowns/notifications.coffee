#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/dropdowns/friend-request'
        'text!tmpl/app/nav/dropdowns/notifications.ejs'], ($, _, Backbone, FriendRequestView, templateText) ->

  class NotificationsDropdownView extends Backbone.View

    initialize: ->
      _.bindAll @

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').appendTo 'body'
      else
        @$el = $('#dropdown-view')

      Shark.friendInvites.on 'add', @render
      Shark.friendInvites.on 'remove', @render

      @template = _.template templateText
      @render()

    render: ->
      @$el.hide().css(right: '160px').html @template()
      $list = @$el.find('.request-list')

      finishRender = =>
        @$el
        @show()

      if Shark.friendInvites.length
        finishCallback = _.after(Shark.friendInvites.length, finishRender)
        $list.removeClass('empty').html('')
        Shark.friendInvites.each (user) =>
          $list.append (new FriendRequestView(model: user)).el
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
      @$el.hide()
      @$el.remove()


  # Whatever is returned here will be usable by other modules
  NotificationsDropdownView
)