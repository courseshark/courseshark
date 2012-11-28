define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/friends/friend.ejs',
        'models/friend'], ($,_, Backbone, friendTemplate, Friend) ->

  class FriendView extends Backbone.View

    initialize: ->
      _.bindAll @
      @friendTemplate = _.template(friendTemplate)
      @render()

    remove_friend: ->
      Shark.friendsList.remove(@model)

    render: ->
      @$el.html @friendTemplate(name: @model.get('firstName') + " " + @model.get('lastName'))
      @

  FriendView
)