define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'dateFormat'
        'collections/schedule-sections'
        'models/course'
        'models/section'
        'text!tmpl/scheduler/schedule/downloads/ics.ejs'], ($, _, Backbone, SharkModel, dateFormat, ScheduleSections, Course, Section, icsTemplate) ->

  class Schedule extends SharkModel

    idAttribute: "_id"
    urlRoot: "/schedules/"

    defaults:
      name: ""
      sections: new ScheduleSections

    initialize: ->
      @icsDownloadTemplate = _.template icsTemplate.replace(/\n/g, '#\n').trim()

    toJSON: ->
      res = {}
      for prop of @attributes
        if typeof @attributes[prop] is 'object'
          res[prop] = _.clone(@attributes[prop].toJSON?())
        else
          res[prop] = _.clone(@attributes[prop])
      return res;

    new: ->
      @.unset '__v'
      @.unset '_id'
      @.set 'name', ''
      @.get('sections').reset()

    load: (success) ->
      @.fetch
        error: ->
          console.log '[error] could not load schedule'
        success: =>
          # Set the global term to this schedule's
          @setLive(success)

    setLive: (success) ->
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
      setClone.unset 'sections'
      Shark.schedule.set setClone
      success?()
      # Trigger the loaded event
      Shark.schedule.trigger 'load'

    ensureScheduleLoaded: (id, options) ->
      if typeof options is 'function'
        options.success = options

      if @.id is id
        options.success?()
        return

      schedule = Shark.schedulesList.get id
      if schedule
        schedule.load options.success
        return
      else
        Shark.schedulesList.fetch
          success: ->
            schedule = Shark.schedulesList.get id
            if schedule
              schedule.load options.success
            else
              options.failure?()




    parse: (response) ->
      response = response[0] if response.length > 0
      if response.sections
        response.sections = new ScheduleSections response.sections.map (s) ->
          s.course = (new Course s.course).id
          s
      response.term = Shark.terms.get response.term
      response


    addSection: (section) ->
      @.get('sections').add section


    removeSection: (section) ->
      @.get('sections').remove @.get('sections').get(section.get('_id'))


    contains: (section) ->
      @.get('sections').where({_id: section.get('_id')}).length > 0

    # Exports the schedule into a .ics file
    export: ->
      resultLink = 'data:text/Calendar;base64,'
      icsTxt = @icsDownloadTemplate @_generateIcsData()
      icsTxt = icsTxt.replace(/#\s*/g, "\r\n").trim()
      resultLink+$.base64.encode(icsTxt)

    # Helper function to generate the ics file on export
    _generateIcsData: ->
      days =
        'monday'    : 'MO'
        'tuesday'   : 'TU'
        'wednesday' : 'WE'
        'thursday'  : 'TH'
        'friday'    : 'FR'
        'saturday'  : 'SA'
        'sunday'    : 'SU'
      events = []
      for section in @.get('sections').models
        evnt =
          name    : section.get('name').replace(/\s?#[0-9]+$/,'')
          daysets : []
        timeCombine = {}
        timeCombineTime = {}
        for ts in section.get 'timeslots'
          startTime = new Date ts.startTime
          endTime = new Date ts.endTime
          endDate = (new Date ts.endDate).format('yyyymmdd')
          startString = startTime.format('yyyymmdd HHMMss').replace(' ','T')
          endString = endTime.format('yyyymmdd HHMMss').replace(' ','T')
          k = startString+'---'+endString
          if not timeCombine[k]
            timeCombine[k] = []
            timeCombineTime[k] =
              'start'    : startString
              'end'      : endString
              'location' : ts.location.toString()
              'endDate'  : endDate+'T'+endTime.format("HHMMss")
          timeCombine[k] = ts.days.map (v,i) -> days[v]

        for timeStr of timeCombine
          evnt['daysets'].push $.extend timeCombineTime[timeStr], days: timeCombine[timeStr].join ','
        events.push evnt
      now = new Date()
      data =
        name     : this.name
        timezone : 'America/New_York'
        now      : now.format('yyyymmdd HHMMss').replace(' ','T')
        events   : events
        user     : 'contact@courseshark.com'
      data


  Schedule
)