define(['jQuery',
        'Underscore',
        'Backbone',
        'models/course'], ($,_, Backbone, Course) ->

  class Friends extends Backbone.Collection

    model: Course

    comparator: (friend)->
      friend.get('name')

  Friends
)