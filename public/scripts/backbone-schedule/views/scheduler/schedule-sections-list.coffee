define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/scheduler/schedule-section'
        'text!tmpl/scheduler/schedule/schedule-sections-list.ejs'], ($,_, Backbone, SharkView, ScheduleSectionView, templateText) ->

  class ScheduleSectionsListView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)

      @subviews = {}

      # Add the newly created section into the list
      Shark.schedule.get('sections').bind 'add', (section) =>
        if not @subviews[section.id]
          @subviews[section.id] = new ScheduleSectionView model: section
        @$list.append @subviews[section.id].el

      # Delete a removed section from the list
      Shark.schedule.get('sections').bind 'remove', (section) =>
        @subviews[section.id].teardown()
        delete @subviews[section.id]
        section.resultView?.reset_add_button()

      # Empty the list on reset ( triggered on load )
      Shark.schedule.get('sections').bind 'reset', () =>
        for view in @subviews
          view.teardown()
        @subviews = {}
        @$list.empty()

      @render()

    # Render the basic container
    render: ->
      @$el.html $ @template()
      @$list = @$el.find('#schedule-sections-list-content') if not @$list
      Shark.schedule.get('sections').each (section) =>
        @subviews[section.id] = new ScheduleSectionView model: section
        @$list.append @subviews[section.id].el

    teardown: ->
      for view in @subviews
        view.teardown?()
      super()

  ScheduleSectionsListView
)