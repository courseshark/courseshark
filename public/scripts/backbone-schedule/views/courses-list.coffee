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
      console.log(@$el)
      @$el.html $ @coursesListTemplate()

  coursesListView
)