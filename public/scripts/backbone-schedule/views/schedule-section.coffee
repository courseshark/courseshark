define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/schedule/schedule-section.ejs',
        'models/schedule'], ($,_, Backbone, scheduleSectionTemplate, Schedule) ->

  class ScheduleSectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      @scheduleSectionTemplate = _.template(scheduleSectionTemplate)

      @render();

    render: ->
      text = @model.number + ": " + @model.name.split(' #')[0]
      @$el.html @scheduleSectionTemplate(course: text)
      @

  ScheduleSectionView
)