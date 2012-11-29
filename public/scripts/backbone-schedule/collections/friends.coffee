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
      @.bind 'all', () ->
        console.log arguments #DEBUG
      @.bind 'add', (friend) ->
        @addFriend friend
      @.bind 'remove', (friend) ->
        @removeFriend friend

    genFriendsHashes: ->
      console.log('gen hash')
      sectionHash = {}
      courseHash = {}
      @.each (friend) =>
        console.log(friend)

    addFriend: (friend) ->
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'put'
          success: (res)=>
            @fetch()


    removeFriend: (friend) ->
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'delete'
          success: (res)=>
            @fetch()

  Friends
)