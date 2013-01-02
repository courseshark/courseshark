#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/app/nav/dropdowns/friend-request.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class FriendRequestView extends SharkView

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

    ignore: ->
      Shark.friendInvites.remove @model
      Shark.friendsList.removeFriend @model

  # Whatever is returned here will be usable by other modules
  FriendRequestView
)