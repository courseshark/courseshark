define(['jQuery',
        'Underscore',
        'Backbone',
        'models/schedule'], ($,_, Backbone, Schedule) ->

  class Schedules extends Backbone.Collection

    url: '/schedules'
    model: Schedule


    load: (number = 0) ->
      @.at(number).load() if @.length > number

  Schedules
)