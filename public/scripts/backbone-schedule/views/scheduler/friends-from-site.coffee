define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/friend'
        'text!tmpl/scheduler/friends/result-friend.ejs'
        'text!tmpl/scheduler/friends/friends-from-site.ejs'], ($, _, Backbone, SharkView, Friend, resultTemplateText, templateText) ->

  class FriendsFromSiteView extends SharkView

    initialize: (options) ->
      _.bindAll @
      @template = _.template templateText
      @singleFriendTemplate = _.template resultTemplateText

      @$target = options.target || $()

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').appendTo 'body'
      else
        @$el = $('#dropdown-view')

      @origionalStyle = @$el.attr('style')
      @$el.attr('style', '').css(width: 300)
      @render()

    events:
      'click .close': 'hide'
      'keyup #search-friends': 'search'
      'click .found-friend': 'addFriend'

    render: ->
      @$el.html @template()
      @show()
      @adjust()


    search: ->
      input = @$el.find '#search-friends'
      query = input.val()
      return if query.length < 3
      $.ajax
        url: '/sandbox/friends/search/'+query
        success: (res) =>
          return if res.query isnt input.val()
          $list = @$el.find '#friends-list'
          $list.empty()
          for user in res.users[0..6]
            do (user) =>
              view = $ @singleFriendTemplate
                name: "#{user.name} (#{user.email})"
                avatar: user.avatar
              view.on 'click', =>
                @addFriend(user)
                @hide()
              view.appendTo $list

    addFriend: (user) ->
      Shark.friendsList.add new Friend user
      console.log "Adding friend", user

    adjust: ->
      $window = $ window

      self_width = @$el.outerWidth()
      self_height = @$el.outerHeight()

      top = @$target.offset().top - self_height - 6
      left = @$target.offset().left - self_width + @$target.outerWidth()

      max_top = $window.innerHeight() - self_height - 30
      max_left = $window.innerWidth() - self_width - 30

      top = Math.min max_top, top
      left = Math.min max_left, left

      top = Math.max top, 50
      left = Math.max left, 10

      @$el.css left: left, top: top, right: '', bottom: '', width: 300

    show: ->
      @$el.show()
      $('#app-container').on 'click', @hide
      $(window).on 'resize', @adjust

    hide: ->
      @teardown()

    teardown: ->
      @$el.attr('style', @origionalStyle)
      $('#app-container').off 'click', @hide
      $(window).off 'resize', @adjust
      super()

  FriendsFromSiteView
)