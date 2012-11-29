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
      @removeMode = false
      @template = _.template(friendsListTemplate)

      # Bind to adding of friends
      Shark.friendsList.bind 'reset', (friends) =>
        @$list.empty()
        Shark.friendsList.each (friend) =>
          friend.listView = friend.listView || new FriendView model: friend
          @$list.append friend.listView.el if @$list
      Shark.friendsList.bind 'remove', (friend) =>
        friend.listView.remove()

      # Rerender list when we log in
      Shark.session.on 'authenticated', () =>
        Shark.friendsList.fetch()

      # Initial render call
      @render()

    events:
      'click #friend-list-add-from-facebook': 'addFirendFromFacebook'
      'click #find-and-add-friends' : 'findAndAddFriends' # Should actuall be a call to a friend finding dialog
      'click #remove-init-button' : 'toggleRemoveMode' # Should actuall be a call to a friend finding dialog

    render: ->
      @$el.html @template()
      @$list = @$el.find('#friends-list-content')


    addFriends: ->
      console.log 'Adding friends. [NOT IMPLEMENTED]'

    findAndAddFriends: ->
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
          else if d.error?.code is 190
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
    toggleRemoveMode: ->
      if not @removeMode
        @$list.addClass('remove-mode')
        $('#remove-init-button').html('Remove Selected')
        @$list.find('.chosen').each (i, friend) ->
          $(friend).removeClass('chosen')
        @removeMode = !@removeMode
        return
      else
        @$list.removeClass('remove-mode')
        $('#remove-init-button').html('&times;')
        Shark.friendsList.each (friend) ->
          if friend.listView.$el.hasClass('chosen')
            Shark.friendsList.remove(friend)
        @removeMode = !@removeMode

  FriendsListView
)