define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Course extends Backbone.Model

    idAttribute: "_id"

  	defaults:
  		rank: 0
  		visible: true

  Course
)