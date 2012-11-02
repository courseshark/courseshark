define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/schedule-sections'], ($,_, Backbone, ScheduleSections) ->

  class Schedule extends Backbone.Model

    defaults:
      name: ""
      sections: new ScheduleSections

    makeClone: ->
      clone = new Schedule
      clone.set('name', @.get('name'))
      @.get('sections').each (section) ->
        clone.get('sections').add section
      clone

    loadSections: (importSections) ->
      sections = @.get('sections')
      sections.reset()
      importSections.each (section) ->
        sections.add(section)

    addSection: (section) ->
      @.get('sections').add (section)

    removeSection: (section) ->
      @.get('sections').remove (section)

    contains: (section) ->
      if _.contains(@.get('sections').models, section)
        true
      else
        false

  Schedule
)