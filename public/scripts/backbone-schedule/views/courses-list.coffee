define(['jQuery',
        'Underscore',
        'Backbone',
        'views/course',
        'text!/tmpl/courses/courses-list.ejs'], ($,_, Backbone, courseView, coursesListTemplate) ->

  class coursesListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @coursesListTemplate = _.template(coursesListTemplate)

      @render();

    render: ->
      @$el.html $ @coursesListTemplate()
      list = @$el.find('#course-list-content')
      model = {crn: "88607", name: "CS 1331"}
      list.append new courseView(model: model).render().el

  coursesListView
)