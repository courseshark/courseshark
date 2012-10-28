define(['jQuery',
        'Underscore',
        'Backbone',
        'models/filter'], ($,_, Backbone, Filter) ->

  class Filters extends Backbone.Collection

    model: Filter

  Filters
)