define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/schedule-sections'], ($,_, Backbone, ScheduleSections) ->

  class Schedule extends Backbone.Model

    defaults:
      name: ""
      sections: new ScheduleSections

    makeClone: =>
      clone = new Schedule
      clone.set('name', @.get('name'))
      clone.set('sections', new ScheduleSections)
      _.each @.get('sections').models, (section) =>
        clone.addSection(section)
      clone

    loadSections: (importSections)=>
      sections = @.get('sections')
      sections.reset()
      _.each importSections.models, (section)=>
        @.addSection(section)

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

  Schedule
)