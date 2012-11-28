define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'], ($, _, Backbone, Friend) ->

  class Friends extends Backbone.Collection

    url: '/friends'
    model: Friend

    comparator: (friend)->
      friend.get('lastName')

  Friends
)