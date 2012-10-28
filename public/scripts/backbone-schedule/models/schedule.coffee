define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/schedule-sections'], ($,_, Backbone, ScheduleSections) ->

  class Schedule extends Backbone.Model

    defaults:
      name: "Name"
      sections: new ScheduleSections

    makeClone: =>
      clone = new Schedule
      clone

    addSection: (section) =>
      @.get('sections').push (section)
      @.trigger('change')

    removeSection: (section) =>
      @.get('sections').remove (section)
      @.trigger('change')

    contains: (section) =>
      if _.contains(@.get('sections').models, section)
        true
      else
        false

    cloneSections: =>
      sections = @.get('sections')
      clone = new ScheduleSections
      _.each sections, (section) =>
        clone.push(section)
      @.set('sections', clone)
      console.log(@.get('sections'))

  Schedule
)