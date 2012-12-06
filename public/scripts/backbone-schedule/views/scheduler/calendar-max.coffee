#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'views/scheduler/calendar-max-section',
  'text!tmpl/scheduler/schedule/calendar-max.ejs'], ($, _, Backbone, CalendarSectionView, templateText) ->

  class CalendarMax extends Backbone.View

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      @model.get('sections').bind 'add', (section) =>
        section.maxCalView = new CalendarSectionView model: section

      @model.get('sections').bind 'remove', (section) =>
        section.maxCalView.remove()

      # Empty the list on reset ( triggered on load )
      @model.get('sections').bind 'reset', () =>
        @render()

      Shark.friendsList.bind 'showFriendsSchedule', (friend) =>
        @showFriendsSchedule friend
      Shark.friendsList.bind 'hideFriendsSchedule', (friend) =>
        @hideFriendsSchedule friend
      # Render call
      @render();

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


  # Whatever is returned here will be usable by other modules
  CalendarMax
)