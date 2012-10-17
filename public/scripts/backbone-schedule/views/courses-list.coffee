define(['jQuery',
        'Underscore',
        'Backbone',
        'views/course',
        'text!/tmpl/courses/courses-list.ejs'], ($,_, Backbone, courseView, coursesListTemplate) ->

  class coursesListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @collection.bind "add", =>
        @render();

      @coursesListTemplate = _.template(coursesListTemplate)

      @render();

    render: ->
      @$el.html $ @coursesListTemplate()
      list = @$el.find('#course-list-content')
      newList = $("<span><span>")
      _.each @collection.models, (course) =>
        newList.append new courseView(model: course.attributes).render().el
      list.html newList

  coursesListView
)