#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'views/shark-view'
  'views/scheduler/calendar-max-section'
  'text!tmpl/scheduler/schedule/calendar-max.ejs'], ($, _, Backbone, SharkView, CalendarSectionView, templateText) ->

  class CalendarMax extends SharkView

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @template = _.template(templateText)

      @subviews = []

      @model.get('sections').bind 'add', (section) =>
        view = new CalendarSectionView model: section
        @subviews.push view
        section.maxCalView = view
      @model.get('sections').bind 'remove', (section) =>
        cid = section.maxCalView.cid
        section.maxCalView.teardown()
        for view, index in @subviews
          if view.cid == cid
            view.teardown()

      # Empty the list on reset ( triggered on load )
      @model.get('sections').bind 'reset', () =>
        @render()

      Shark.friendsList.bind 'showFriendsSchedule', @showFriendsSchedule
      Shark.friendsList.bind 'hideFriendsSchedule', @hideFriendsSchedule
      # Render call
      @render()

    # Renders the actual view from the template
    render: ->
      @$el.html @template({startHour: 6, endHour: 22})
      @model.get('sections').each (section) =>
        section.maxCalView = new CalendarSectionView model: section

    showFriendsSchedule: (friend) ->
      return if not friend.get('schedule')?.get('sections')?.length
      friend.get('schedule').get('sections').each (section) ->
        section.color = () -> return friend.color()
        section.maxCalView = new CalendarSectionView model: section
        section.maxCalView.setFriend(true)

    hideFriendsSchedule: (friend) ->
      return if not friend.get('schedule')?.get('sections')?.length
      friend.get('schedule').get('sections').each (section) ->
        section.maxCalView?.remove()

    teardown: ->
      Shark.friendsList.unbind 'showFriendsSchedule', @showFriendsSchedule
      Shark.friendsList.unbind 'hideFriendsSchedule', @hideFriendsSchedule
      for view in @subviews
        view?.teardown?()
      super()

  # Whatever is returned here will be usable by other modules
  CalendarMax
)