define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Course extends Backbone.Model

  	defaults:
  		rank: 0
  		visible: true

  
  Course
)