define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'], ($, _, Backbone, Friend) ->

  class FriendInvites extends Backbone.Collection

    url: '/sandbox/friends/invites'
    model: Friend

    comparator: (friend) ->
      # Sort by confirmed then by firstName
      friend.get('firstName')

  FriendInvites
)