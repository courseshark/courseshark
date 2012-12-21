define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/friend'
        'text!tmpl/scheduler/friends/friend.ejs'], ($,_, Backbone, SharkView, Friend, templateText) ->

  class FriendView extends SharkView

    className: 'friend-block'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    events:
      'click .remove-friend' : 'remove_friend'
      'click .avatar' : 'toggleBig'

    remove_friend: =>
      Shark.friendsList.remove(@model)

    render: ->
      name = [@model.get('firstName'),@model.get('lastName')].join(' ')
      @$el.html @template(
          name: name
          avatar: @model.get 'avatar'
          confirmed: @model.get 'confirmed'
        )
      @$el.data 'cid', @model.cid
      @$el.tooltip title: name
      @delegateEvents()
      @

    show: ->
      @render()

    toggleBig: ->
      @$el.toggleClass 'chosen'
      if @$el.hasClass 'chosen'
        @$el.css border: '3px solid '+@model.color()
        Shark.friendsList.trigger('showFriendsSchedule', @model)
        mixpanel.track 'View Friend Schedule', Shark.config.asObject()
      else
        @$el.css border: 'none'
        Shark.friendsList.trigger('hideFriendsSchedule', @model)
        mixpanel.track 'Hide Friend Schedule', Shark.config.asObject()

    teardown: ->
      super()
      if @$el.hasClass 'chosen'
        @$el.css(border: 'none').removeClass('chosen')

  FriendView
)