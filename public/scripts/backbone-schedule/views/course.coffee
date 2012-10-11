define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/courses/course.ejs'], ($,_, Backbone, courseTemplate) ->

  class coursesListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @courseTemplate = _.template(courseTemplate)

      @render();

    render: ->
      text = @model.crn + ": " + @model.name
      @$el.html @courseTemplate(course: text)
      @

  coursesListView
)