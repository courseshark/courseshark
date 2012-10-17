define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/courses'], ($,_, Backbone, Courses) ->

  class Schedule extends Backbone.Model

    defaults:
      name: "Name"
      courses: new Courses

  Schedule
)