define(['jQuery',
        'Underscore',
        'Backbone',
        'models/course'], ($,_, Backbone, Course) ->

  class ResultCourses extends Backbone.Collection

    model: Course

    # Determines order of courses in collection
    comparator: (course)->
      # Sort the sections based on the search rank
      -course.get('rank')

  ResultCourses
)