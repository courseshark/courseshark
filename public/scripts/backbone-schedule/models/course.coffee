define(['jQuery',
        'Underscore',
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class Course extends SharkModel

    idAttribute: "_id"

  	defaults:
  		rank: 0
  		visible: true

  Course
)