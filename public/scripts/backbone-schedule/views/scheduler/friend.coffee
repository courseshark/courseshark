define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'
        'text!tmpl/scheduler/friends/friend.ejs'], ($,_, Backbone, Friend, templateText) ->

  class FriendView extends Backbone.View

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
      @

    toggleBig: ->
      @$el.toggleClass 'chosen'

  FriendView
)