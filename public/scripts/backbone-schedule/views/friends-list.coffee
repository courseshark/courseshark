define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/friends/friends-list.ejs'
        'views/friend'
        'models/friend'], ($,_, Backbone, friendsListTemplate, FriendView, Friend) ->

  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @friendsListTemplate = _.template(friendsListTemplate)

      Shark.friendsList.bind 'add', (friend) =>
        @$list.append (new FriendView model: friend).el

      @render();

    events:
      'click #add-friend' : 'add_friend'

    add_friend: ->
      Shark.friendsList.add new Friend {firstName: "Bob", lastName: "Smith"}

    render: ->
      @$el.html $ @friendsListTemplate()
      @$list = @$el.find('#friends-list-content') if not @$list
      Shark.friendsList.fetch success: =>
        Shark.friendsList.each (friend) =>
          @$list.append (new FriendView model: friend).el


  FriendsListView
)