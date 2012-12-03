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

      # Render call
      @render();

    # Renders the actual view from the template
    render: ->
      @$el.html @template({startHour: 6, endHour: 22})


  # Whatever is returned here will be usable by other modules
  CalendarMax
)