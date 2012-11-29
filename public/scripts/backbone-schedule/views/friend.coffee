define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/friends/friend.ejs',
        'models/friend'], ($,_, Backbone, friendTemplate, Friend) ->

  class FriendView extends Backbone.View

    initialize: ->
      _.bindAll @
      @friendTemplate = _.template(friendTemplate)
      @render()

    events:
      'click .remove-friend' : 'remove_friend'

    remove_friend: =>
      Shark.friendsList.remove(@model)
      @.remove()

    render: ->
      @$el.html @friendTemplate(name: @model.get('firstName') + " " + @model.get('lastName'))
      @

  FriendView
)