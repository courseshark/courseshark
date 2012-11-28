define(['jQuery'
        'Underscore'
        'Backbone'
        'collections/facebook-friends-results'
        'views/friends-from-facebook'
        'text!tmpl/friends/friends-list.ejs'], ($,_, Backbone, FacebookFriendsResults, FriendsFromFacebookView, friendsListTemplate) ->

  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @friendsListTemplate = _.template(friendsListTemplate)

      @render();

    events:
      'click #friend-list-add-from-facebook': 'addFirendFromFacebook'

    render: ->
      @$el.html $ @friendsListTemplate()


    addFirendFromFacebook: ->
      $.ajax url: '/friends/find-from-facebook', success: (d) ->
        if not d.error
          friends = d
          @friendPicker = new FriendsFromFacebookView(model: new FacebookFriendsResults(friends))
          @friendPicker.show()

  FriendsListView
)