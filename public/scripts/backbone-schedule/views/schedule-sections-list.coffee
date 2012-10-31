define(['jQuery',
        'Underscore',
        'Backbone',
        'views/schedule-section',
        'text!/tmpl/schedule/schedule-sections-list.ejs'], ($,_, Backbone, ScheduleSectionView, scheduleSectionsListTemplate) ->

  class ScheduleSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @scheduleSectionsListTemplate = _.template(scheduleSectionsListTemplate)

      # Add the newly created section into the list
      Shark.schedule.get('sections').bind 'add', (section) =>
        if not section.listView
          section.listView = new ScheduleSectionView model: section
        @$list.append section.listView.el

      # Delete a removed section from the list
      Shark.schedule.get('sections').bind 'remove', (section) =>
        section.listView.remove()

      # Empty the list on reset ( triggered on load )
      Shark.schedule.get('sections').bind 'reset', () =>
        @$list.empty()

      @render()

    # Render the basic container
    render: ->
      @$el.html $ @scheduleSectionsListTemplate()
      @$list = @$el.find('#schedule-sections-list-content') if not @$list

  ScheduleSectionsListView
)