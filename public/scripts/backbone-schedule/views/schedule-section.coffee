define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/schedule/schedule-section.ejs',
        'models/schedule'], ($,_, Backbone, scheduleSectionTemplate, Schedule) ->

  class ScheduleSectionView extends Backbone.View

    initialize: ->
      _.bindAll @
      @scheduleSectionTemplate = _.template(scheduleSectionTemplate)
      @render()

    render: ->
      number = @model.get 'number'
      name = @model.get('name').split(' #')[0]
      @$el.html @scheduleSectionTemplate(number: number, name: name, color:@model.color())
      @

  ScheduleSectionView
)