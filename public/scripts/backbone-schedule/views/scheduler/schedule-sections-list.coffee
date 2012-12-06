define(['jQuery',
        'Underscore',
        'Backbone',
        'views/scheduler/schedule-section',
        'text!tmpl/scheduler/schedule/schedule-sections-list.ejs'], ($,_, Backbone, ScheduleSectionView, templateText) ->

  class ScheduleSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)

      # Add the newly created section into the list
      Shark.schedule.get('sections').bind 'add', (section) =>
        if not section.listView
          section.listView = new ScheduleSectionView model: section
        @$list.append section.listView.el

      # Delete a removed section from the list
      Shark.schedule.get('sections').bind 'remove', (section) =>
        section.listView.remove()
        section.listView = 0
        section.resultView?.reset_add_button()

      # Empty the list on reset ( triggered on load )
      Shark.schedule.get('sections').bind 'reset', () =>
        @$list.empty()

      @render()

    # Render the basic container
    render: ->
      @$el.html $ @template()
      @$list = @$el.find('#schedule-sections-list-content') if not @$list
      Shark.schedule.get('sections').each (section) =>
        section.listView = new ScheduleSectionView model: section
        @$list.append section.listView.el

  ScheduleSectionsListView
)