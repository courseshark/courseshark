define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'
        'text!tmpl/scheduler/friends/friends-from-facebook.ejs'], ($, _, Backbone, Friend, templateText) ->

  class FriendsFromFacebookView extends Backbone.View

    tagName: "div"

    className: "modal fade"

    events:
      "click .close": "close"
      "click .friend-option": "toggleFriend"
      "click .select-friend": "toggleFriend"
      "click #do-add-friends": "addFriends"

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html(@template(list: @model)).appendTo('body')

    addFriends: ->
      @hide()
      @$el.find('.friend-option.chosen').each (index, friendChosen) ->
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

  FriendsFromFacebookView
)