define(['jQuery'
        'Underscore'
        'Backbone'
        'models/schedule'
        'text!tmpl/schedule/schedule-section.ejs'], ($,_, Backbone, Schedule, templateText) ->

  class ScheduleSectionView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    events:
      'click .schedule-remove' : 'schedule_remove'

    schedule_remove: ->
      Shark.schedule.removeSection(@model)

    render: ->
      number = @model.get 'number'
      name = @model.get('name').split(' #')[0]
      @$el.html @template number: number, name: name, color:@model.color(), colorClear:@model.color(0.3)
      @

  ScheduleSectionView
)