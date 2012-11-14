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

    render: ->
      @$el.html @friendTemplate(name: @model.name)
      @

  FriendView
)