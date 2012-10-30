define(['jQuery',
        'Underscore',
        'Backbone',
        'models/schedule'], ($,_, Backbone, Schedule) ->

  class Schedules extends Backbone.Collection

    model: Schedule

  Schedules
)