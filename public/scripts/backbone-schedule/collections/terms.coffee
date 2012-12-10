define(['jQuery',
        'Underscore',
        'Backbone',
        'models/term'], ($,_, Backbone, Term) ->

  class Terms extends Backbone.Collection

    model: Term

    baseUrl: '/api/terms/'
    # # Determines order of sections in collection
    comparator: (term)->
      -term.get('number')

    fetch: () ->
      @url = @baseUrl + Shark.school.id
      super

  Terms
)