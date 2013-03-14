define(['jQuery',
        'Underscore',
        'Backbone',
        'models/section'], ($,_, Backbone, Section) ->

  class ResultSections extends Backbone.Collection

    model: Section

    # Determines order of sections in collection
    comparator: (section)->
      # Sort the sections based on section letter/number
      -section.get('rank')

  ResultSections
)