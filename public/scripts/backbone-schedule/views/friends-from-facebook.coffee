define(['jQuery'
        'Underscore'
        'Backbone'
        'text!tmpl/friends/friends-from-facebook.ejs'], ($, _, Backbone, templateText) ->

  class FriendsFromFacebookView extends Backbone.View

    tagName: "div"

    className: "modal fade"

    events:
      "click .close": "close"
      "click .friend-option": "toggleFriend"
      "click .select-friend": "toggleFriend"

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html(@template(list: @model)).appendTo('body')

    toggleFriend: (e) ->
      e.stopImmediatePropagation()
      $target = $ e.target
      while not $target.is('li') and $target.parent()
        $target = $target.parent()
      $target.toggleClass('chosen')
      console.log '->',arguments

    show: ->
      @$el.modal 'show'

    hide: ->
      @close()

    close: ->
      @$el.modal 'hide'

  FriendsFromFacebookView
)