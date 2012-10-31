#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'views/calendar-mini-section',
  'text!/tmpl/schedule/calendar-mini.ejs'], ($, _, Backbone, CalendarSectionView, templateText) ->

  class CalendarMini extends Backbone.View

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      @model.get('sections').bind 'add', (section) =>
        section.miniCalView = new CalendarSectionView model: section

      @model.get('sections').bind 'remove', (section) =>
        section.miniCalView.remove()

      # Render call
      @render();

    # Renders the actual view from the template
    render: ->
      @$el.html @template({startHour: 6, endHour: 21})


  # Whatever is returned here will be usable by other modules
  CalendarMini
)