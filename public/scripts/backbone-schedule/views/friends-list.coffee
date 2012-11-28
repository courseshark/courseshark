define(['jQuery'
        'Underscore'
        'Backbone'
        'collections/facebook-friends-results'
        'views/friends-from-facebook'
        'text!tmpl/friends/friends-list.ejs'], ($,_, Backbone, FacebookFriendsResults, FriendsFromFacebookView, friendsListTemplate) ->

  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(friendsListTemplate)
      @render()

    events:
      'click .add-friends': 'addFriends'
      'click #friend-list-add-from-facebook': 'addFirendFromFacebook'

    render: ->
      @$el.html @template(list: Shark.friends)


    addFriends: -> console.log 'adding Friend'

    addFirendFromFacebook: ->
      if Shark.session.authenticated()
        $.ajax url: '/friends/find-from-facebook', success: (d) =>
          if not d.error
            friends = d
            @friendPicker = new FriendsFromFacebookView(model: new FacebookFriendsResults(friends))
            @friendPicker.show()
          else if d.error is "No Facebook token exists for user"
            @addFirendFromFacebookLogin()
      else
        @addFirendFromFacebookLogin()

    addFirendFromFacebookLogin: ->
      FB.getLoginStatus (response) =>
        if response.status is 'connected'
          # We want to link the account so call facebookAuth()
          Shark.session.facebookAuth response.authResponse.accessToken, @addFirendFromFacebook
        else
          # Either not logged in or not authorized
          # both solvable with a call to login
          FB.login (loginResponse) ->
            if loginResponse.authResponse
              Shark.session.facebookAuth loginResponse.authResponse.accessToken, @addFirendFromFacebook



  FriendsListView
)