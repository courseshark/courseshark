define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'collections/facebook-friends-results'
        'models/friend'
        'views/scheduler/friends-from-facebook'
        'views/scheduler/friends-from-site'
        'views/scheduler/friend'
        'text!tmpl/scheduler/friends/friends-list.ejs'], ($,_, Backbone, SharkView, FacebookFriendsResults, Friend, FriendsFromFacebookView, FriendsFromSiteView, FriendView, templateText) ->


  class FriendsListView extends SharkView

    initialize: ->
      _.bindAll @
      @removeMode = false
      @template = _.template(templateText)

      # Bind to adding of friends
      Shark.friendsList.bind 'reset', (friends) =>
        @$list.empty()
        Shark.friendsList.genFriendsHashes()
        Shark.friendsList.each (friend) =>
          friend.listView?.teardown?()
          friend.listView = new FriendView model: friend
          @$list.append friend.listView.el if @$list
      Shark.friendsList.bind 'addComplete', (friend) =>
        console.log 'here'
        friend.listView = new FriendView model: friend
        @$list.append friend.listView.el if @$list
      Shark.friendsList.bind 'remove', (friend) =>
        friend.listView?.teardown?()
      Shark.session.bind 'authenticated', ()=>
        @$el.find('#remove-init-button').show()
      Shark.session.bind 'unauthenticated', ()=>
        @$el.find('#remove-init-button').hide()

      # Initial render call
      @render()

    events:
      'click #friend-list-add-from-facebook': 'addFirendFromFacebook'
      'click #find-and-add-friends' : 'findAndAddFriends' # Should actuall be a call to a friend finding dialog
      'click #remove-init-button' : 'toggleRemoveMode' # Should actuall be a call to a friend finding dialog

    render: ->
      @$el.html @template()
      @$list = @$el.find('#friends-list-content')
      @$list.empty()
      Shark.friendsList.genFriendsHashes()
      Shark.friendsList.each (friend) =>
        friend.listView = friend.listView?.show() || new FriendView model: friend
        @$list.append friend.listView.el if @$list


    findAndAddFriends: (e) =>
      return Shark.session.login(@findAndAddFriends) if not Shark.session.authenticated()
      e?.stopPropagation()
      @friendPicker?.teardown()
      @friendPicker = new FriendsFromSiteView target: @$el.find '#find-and-add-friends'

    addFirendFromFacebook: =>

      @friendPicker?.teardown()
      @friendPicker = new FriendsFromFacebookView model: new FacebookFriendsResults
      @friendPicker.show()

      (_.debounce () =>
        if Shark.session.authenticated()
          $.ajax url: '/friends/find-from-facebook', success: (d) =>
            if not d.error
              @friendPicker.model.add d
              mixpanel.track 'Find Friends', Shark.config.asObject({through: "Facebook"})
            else if d.error is "No Facebook token exists for user"
              @addFirendFromFacebookLogin()
            else if d.error?.code is 190
              @addFirendFromFacebookLogin()
        else
          @addFirendFromFacebookLogin()
      , 200)()

    addFirendFromFacebookLogin: =>
      FB.getLoginStatus (response) =>
        if response.status is 'connected'
          # We want to link the account so call facebookAuth()
          Shark.session.facebookAuth response.authResponse.accessToken, @addFirendFromFacebook
        else
          # Either not logged in or not authorized
          # both solvable with a call to login
          FB.login (loginResponse) =>
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
        @$el.find('.chosen').each (i, friendElement) ->
          friend = Shark.friendsList.getByCid($(friendElement).data('cid'))
          Shark.friendsList.remove(friend)
        @removeMode = !@removeMode

    teardown: ->
      Shark.friendsList.each (friend) ->
        friend.listView?.teardown?()
      super()

  FriendsListView
)