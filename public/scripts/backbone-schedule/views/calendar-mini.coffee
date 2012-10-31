#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'views/calendar-mini-section',
  'text!/tmpl/schedule/calendar-mini.ejs'], ($, _, Backbone, CalendarMiniSectionView, templateText) ->

  class CalendarMini extends Backbone.View

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      @model.get('sections').bind 'add', (section) =>
        if not section.miniCalView
          section.miniCalView = new CalendarMiniSectionView model: section
        else
          section.miniCalView.render()
        section.miniCalView.setTemp false

      @model.get('sections').bind 'remove', (section) =>
        section.miniCalView.remove()
        section.miniCalView.setTemp true

      # Render call
      @render();

    # Renders the actual view from the template
    render: ->
      @$el.html @template({startHour: 6, endHour: 21})


  # Whatever is returned here will be usable by other modules
  CalendarMini
)