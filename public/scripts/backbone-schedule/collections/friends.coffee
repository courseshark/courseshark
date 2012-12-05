define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'
        'models/schedule'], ($, _, Backbone, Friend, Schedule) ->

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

    genFriendsHashes: ->
      sectionHash = {}
      @.each (friend) =>
        if friend.get('schedule')
          friend.get('schedule').get('sections').each (section) =>
            if sectionHash[section.id]
              sectionHash[section.id].push friend.id
            else
              sectionHash[section.id] = [friend.id]
      Shark.sectionFriends = sectionHash

    addFriend: (friend) ->
      return if not friend.id
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'put'
          success: (res)=>
            if (!res)
              @remove(friend)
            newFriend = new Friend(res)
            @remove(friend, {silent: true})
            @add(newFriend, {silent: true})
            @trigger 'addComplete', newFriend


    removeFriend: (friend) ->
      $.ajax
          url: '/sandbox/friends/'+friend.id
          type: 'delete'
          success: (res)=> return


    parse: (response) ->
      console.log response
      s = new Schedule()
      for friend in response
        if friend.schedule
          friend.schedule = new Schedule(s.parse(friend.schedule))

      response

  Friends
)