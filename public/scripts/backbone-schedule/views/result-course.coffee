define(['jQuery',
        'Underscore',
        'Backbone',
        'models/course'
        'text!/tmpl/results/result-course.ejs'], ($,_, Backbone, Course, resultCourseTemplate) ->

  class ResultCourseView extends Backbone.View

    model: Course

    initialize: ->
      _.bindAll @
      @template = _.template resultCourseTemplate
      @render()

    events:
      'click .results-course': 'toggleSections'

    toggleSections: ->
      console.log 'toggle',@model.get('sections').length,'sections'

    render: ->
      params =
        name: @model.get 'name'
        departmentAbbr: @model.get('departmentAbbr')
        number: @model.get 'number'
      @$el.html @template params
      @ # Return the section view to be added by the results view

  ResultCourseView
)