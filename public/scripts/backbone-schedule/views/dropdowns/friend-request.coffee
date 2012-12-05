#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'text!tmpl/app/nav/dropdowns/friend-request.ejs'], ($, _, Backbone, templateText) ->

  class FriendRequestView extends Backbone.View

    className: 'friend-request'

    initialize: ->
      _.bindAll @

      @template = _.template templateText
      @render()

    render: ->
      @$el.html @template user: @model

    events:
      'click .accept-request': 'accept'
      'click .ignore-request': 'ignore'

    accept: ->
      Shark.friendInvites.remove @model
      Shark.friendsList.add(@model)
      console.log 'Accepting request', @model

    ignore: ->
      Shark.friendInvites.remove @model
      console.log 'Ignoring request', @model

  # Whatever is returned here will be usable by other modules
  FriendRequestView
)