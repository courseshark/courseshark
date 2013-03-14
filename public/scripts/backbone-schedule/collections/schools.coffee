define(['jQuery',
        'Underscore',
        'Backbone',
        'models/school'], ($,_, Backbone, School) ->

  class Schools extends Backbone.Collection

    url: '/api/schools'
    model: School

  Schools
)