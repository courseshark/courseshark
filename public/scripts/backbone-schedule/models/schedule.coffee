define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/schedule-sections'], ($,_, Backbone, ScheduleSections) ->

  class Schedule extends Backbone.Model

    defaults:
      name: "Name"
      sections: new ScheduleSections

  Schedule
)