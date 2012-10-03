define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone, sectionTemplate) ->

  class Section extends Backbone.Model

    defaults:
      number: 123
      info: 'Here is some info about the course? I guess?'
      type: 'Type'
      name: 'Name'
      course: 'Course'
      department: 'Department'
      term: 'Term'
      instructor: 'Instructor'
      seatsAvailable: 'SA'
      seatsTotal: 'ST'
      waitSeatsAvailable: 'WA'
      waitSeatsTotal: 'WT'
      timeslots: 'timeslots'

  Section
)