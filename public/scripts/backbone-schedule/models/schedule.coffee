define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/schedule-sections'
        'models/course',
        'models/section'], ($,_, Backbone, ScheduleSections, Course, Section) ->

  class Schedule extends Backbone.Model

    idAttribute: "_id"
    urlRoot: "/schedules/"

    defaults:
      name: ""
      sections: new ScheduleSections

    new: ->
      @.unset('__v')
      @.unset('_id')
      @.set('name', '')
      @.get('sections').reset()

    load: (scheduleToLoad) ->
      @.fetch
        error: =>
          console.log '[error] could not load schedule'
        success: =>
          # Set the global term to this schedule's
          Shark.term = @.get 'term'
          # Set the sections
          Shark.schedule.get('sections').reset()
          @.get('sections').each (section) ->
            Shark.schedule.get('sections').add section
          # Set the other properties (minus sections)
          # Here we make a clone, then unset the sections attribute
          #   If we dont do this, then all the views that bind to the
          #   schedule's sections list will become unbound.
          setClone = @.clone()
          setClone.unset('sections')
          Shark.schedule.set(setClone)
          # Trigger the loaded event
          Shark.schedule.trigger 'load'

    parse: (response) ->
      response = response[0] if response.length > 0
      if response.sections
        response.sections = new ScheduleSections response.sections.map (s) ->
          s.course = new Course s.course
          s
      response.term = Shark.terms.get(response.term)
      response


    addSection: (section) ->
      @.get('sections').add (section)

    removeSection: (section) ->
      @.get('sections').remove(@.get('sections').get(section.get('_id')))

    contains: (section) ->
      @.get('sections').where({_id: section.get('_id')}).length > 0

  Schedule
)