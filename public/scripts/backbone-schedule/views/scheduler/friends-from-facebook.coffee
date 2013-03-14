define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/friend'
        'text!tmpl/scheduler/friends/facebook-friend.ejs'
        'text!tmpl/scheduler/friends/friends-from-facebook.ejs'], ($, _, Backbone, SharkView, Friend, friendTemplateText, templateText) ->

  class FriendsFromFacebookView extends SharkView

    tagName: "div"

    className: "modal"

    events:
      "click .close": "close"
      "click .friend-option": "toggleFriend"
      "click .select-friend": "toggleFriend"
      "click #do-add-friends": "addFriends"

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @friendTemplate = _.template friendTemplateText
      @model.on 'add', @addFriendToView
      @render()


    render: ->
      @$el.html(@template()).appendTo('body')

    addFriendToView: (friend) ->
      @$el.find('.media-list .loading').hide()
      @$el.find('.media-list').append @friendTemplate user: friend

    addFriends: ->
      @hide()
      $chosen = @$el.find('.friend-option.chosen')
      mixpanel.track 'Add Friends', Shark.config.asObject({count: $chosen.length })
      $chosen.each (index, friendChosen) ->
        Shark.friendsList.add(
          new Friend
            _id: $(friendChosen).data('user-id')
            firstName: $(friendChosen).data('user')
            lastName: ''
            avatar: 'https://graph.facebook.com/'+$(friendChosen).data('user-fbid')+'/picture'
        )

    toggleFriend: (e) ->
      e.stopImmediatePropagation()
      $target = $ e.target
      while not $target.is('li') and $target.parent()
        $target = $target.parent()
      $target.toggleClass('chosen')

    show: ->
      @$el.modal 'show'

    hide: ->
      @close()

    close: ->
      @$el.modal 'hide'
      @$el.on 'hidden', () ->
        @teardown()

    teardown: ->
      @hide()
      super

  FriendsFromFacebookView
)