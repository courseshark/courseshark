define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'
        'text!tmpl/scheduler/friends/friend.ejs'], ($,_, Backbone, Friend, templateText) ->

  class FriendView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    events:
      'click .remove-friend' : 'remove_friend'

    remove_friend: =>
      Shark.friendsList.remove(@model)

    render: ->
      @$el.html @template(
          name: [@model.get('firstName'),@model.get('lastName')].join(' ')
          avatar: @model.get 'avatar'
          confirmed: @model.get 'confirmed'
        )
      @

  FriendView
)