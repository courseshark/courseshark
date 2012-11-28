define(['jQuery'
        'Underscore'
        'Backbone'
        'collections/facebook-friends-results'
        'models/friend'
        'views/friends-from-facebook'
        'views/friend'
        'text!tmpl/friends/friends-list.ejs'], ($,_, Backbone, FacebookFriendsResults, Friend, FriendsFromFacebookView, FriendView, friendsListTemplate) ->


  class FriendsListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(friendsListTemplate)

      # Bind to adding of friends
      Shark.friendsList.bind 'add', (friend) =>
        @$list.append (new FriendView model: friend).el

      # Rerender list when we log in
      Shark.session.on 'authenticated', ()=>
        @render()

      # Initial render call
      @render()

    events:
      'click #friend-list-add-from-facebook': 'addFirendFromFacebook'
      'click #find-and-add-friends' : 'findAndAddFriends' # Should actuall be a call to a friend finding dialog

    render: ->
      @$el.html @template(list: Shark.friendsList)
      @$list = @$el.find('#friends-list-content')
      Shark.friendsList.fetch success: =>
        Shark.friendsList.each (friend) =>
          @$list.append (new FriendView model: friend).el

    addFriends: ->
      console.log 'Adding friends. [NOT IMPLEMENTED]'

    findAndAddFriends: ->
      console.log 'here'
      # Would actually open a dialog to find friends with
      Shark.friendsList.add new Friend {firstName: "Bob", lastName: "Smith"}

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