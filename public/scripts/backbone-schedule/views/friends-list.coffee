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

    render: ->
      @$el.html $ @friendsListTemplate()
      @$list = @$el.find('#friends-list-content') if not @$list
      @$list.html (new FriendView model: {name: "Bob"}).el
      @$list.append (new FriendView model: {name: "Jill"}).el
      @$list.append (new FriendView model: {name: "Sam"}).el

  FriendsListView
)