define(['jQuery'
        'Underscore'
        'Backbone'
        'models/friend'], ($, _, Backbone, Friend) ->

  class Friends extends Backbone.Collection

    url: '/sandbox/friends'
    model: Friend

    comparator: (friend)->
      friend.get('lastName')

    initialize: ->
      @.bind 'all', () ->
        console.log arguments
      @.bind 'add', (friend) ->
        @addFriend friend
      @.bind 'remove', (friend) ->
        @removeFriend friend

    save: ->
      options =
        success: (model, resp, xhr) =>
          @.reset model
      Backbone.sync 'update', @, options

    addFriend: (friend) ->
      $.ajax
          url: '/friends/'+friend.id
          type: 'put'
          success: (res)=>
            console.log res

  Friends
)