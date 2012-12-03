#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'views/scheduler/calendar-mini-section',
  'text!tmpl/scheduler/schedule/calendar-mini.ejs'], ($, _, Backbone, CalendarMiniSectionView, templateText) ->

  class CalendarMini extends Backbone.View

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      Shark.schedule.get('sections').bind 'add', (section) =>
        if not section.miniCalView
          section.miniCalView = new CalendarMiniSectionView model: section
        else
          section.miniCalView.render()
        section.miniCalView.setTemp false

      Shark.schedule.get('sections').bind 'remove', (section) =>
        section.miniCalView.remove()
        section.miniCalView.setTemp true

      # Empty the list on reset ( triggered on load )
      Shark.schedule.get('sections').bind 'reset', () =>
        @render()

      # Render call
      @render();

    # Renders the actual view from the template
    render: ->
      @$el.html @template({startHour: 6, endHour: 21})


  # Whatever is returned here will be usable by other modules
  CalendarMini
)