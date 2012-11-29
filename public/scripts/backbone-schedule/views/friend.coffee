define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/friends/friend.ejs',
        'models/friend'], ($,_, Backbone, friendTemplate, Friend) ->

  class FriendView extends Backbone.View

    className: 'friend-block'

    initialize: ->
      _.bindAll @
      @friendTemplate = _.template(friendTemplate)
      @render()

    events:
      'click .remove-friend' : 'remove_friend'
      'click .avatar' : 'toggleBig'

    remove_friend: =>
      Shark.friendsList.remove(@model)

    render: ->
      name = [@model.get('firstName'),@model.get('lastName')].join(' ')
      @$el.html @friendTemplate(
          name: name
          avatar: @model.get 'avatar'
          confirmed: @model.get 'confirmed'
        )
      @$el.tooltip title: name
      @

    toggleBig: ->
      console.log 'howdy there'
      @$el.toggleClass 'chosen'

  FriendView
)