define(['jQuery',
        'Underscore',
        'Backbone',
        'models/friend'], ($,_, Backbone, Friend) ->

  class Friends extends Backbone.Collection

    model: Friend

    url: "/sandbox/friends"

    comparator: (friend)->
      friend.get('name')

  Friends
)