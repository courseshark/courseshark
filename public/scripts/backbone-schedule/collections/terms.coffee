define(['jQuery',
        'Underscore',
        'Backbone',
        'models/term'], ($,_, Backbone, Term) ->

  class Terms extends Backbone.Collection

    model: Term

    url: '/schedule/terms'
    # # Determines order of sections in collection
    comparator: (term)->
      -term.get('number')


  Terms
)