define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/friends/friends-list.ejs'], ($,_, Backbone, friendsListTemplate) ->

  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @friendsListTemplate = _.template(friendsListTemplate)

      @render();

    render: ->
      console.log(@$el)
      @$el.html $ @friendsListTemplate()

  FriendsListView
)