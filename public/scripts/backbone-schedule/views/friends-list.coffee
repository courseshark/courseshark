define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/friends/friends-list.ejs'
        'views/friend'], ($,_, Backbone, friendsListTemplate, FriendView) ->

  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @friendsListTemplate = _.template(friendsListTemplate)

      @render();

    add: ->
      Shark.friendsList.add new Friend {firstName: "Bob", lastName: "Smith"}

    render: ->
      @$el.html $ @friendsListTemplate()
      @$list = @$el.find('#friends-list-content') if not @$list
      Shark.friendsList.fetch success: =>
        Shark.friendsList.each (friend) =>
          @$list.append (new FriendView model: friend).el


  FriendsListView
)