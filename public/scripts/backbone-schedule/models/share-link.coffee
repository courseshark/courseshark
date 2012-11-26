define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/schedule'
        'models/term'
        'collections/schedule-sections'], ($, _, Backbone, SharkModel, Schedule, Term, ScheduleSections) ->

  class ShareLink extends SharkModel

    idAttribute: "hash"

    urlRoot: '/links'

    initialize: ->
      _.bindAll @

    parse: (response) ->
      response.schedule = new Schedule(response._schedule[0])
      response.schedule.set 'sections', new ScheduleSections response._schedule[0].sections
      response.schedule.set 'term', new Term response._schedule[0].term
      response

  ShareLink
)