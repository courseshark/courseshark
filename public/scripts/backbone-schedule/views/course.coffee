define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/courses/course.ejs',
        'models/schedule'], ($,_, Backbone, courseTemplate, Schedule) ->

  class coursesListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @courseTemplate = _.template(courseTemplate)

      @render();

    render: ->
      text = @model.number + ": " + @model.name.split(' #')[0]
      @$el.html @courseTemplate(course: text)
      @

  coursesListView
)