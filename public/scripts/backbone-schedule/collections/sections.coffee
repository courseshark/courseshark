define(['jQuery',
        'Underscore',
        'Backbone',
        'models/section'], ($,_, Backbone, Section) ->

  class Sections extends Backbone.Collection

    model: Section

    # Determines order of sections in collection
    comparator: (section)->
      # Sort the sections based on section letter/number
      section.attributes.info


  Sections
)