define(['jQuery',
        'Underscore',
        'Backbone',
        'models/section'], ($,_, Backbone, Section) ->

  class Courses extends Backbone.Collection

    model: Section

    # # Determines order of sections in collection
    # comparator: (section)->
    #   # Sort the sections based on section letter/number
    #   section.attributes.info


  Courses
)