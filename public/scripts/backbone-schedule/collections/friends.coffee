define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'], ($, _, Backbone, Friend) ->

  class Friends extends Backbone.Collection

    url: '/sandbox/friends'
    model: Friend

    comparator: (friend) ->
      # Sort by confirmed then by firstName
      if friend.get('confirmed')
        '0'+friend.get('firstName')
      else
        '1'+friend.get('firstName')

    initialize: ->
      @.bind 'add', (friend) ->
        @addFriend friend
      @.bind 'remove', (friend) ->
        @removeFriend friend


    addFriend: (friend) ->
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'put'
          success: (res)=>
            newFriend = new Friend(res)
            @remove(friend, {silent: true})
            @add(newFriend, {silent: true})


    removeFriend: (friend) ->
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'delete'
          success: (res)=> return

  Friends
)