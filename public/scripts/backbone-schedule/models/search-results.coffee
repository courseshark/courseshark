define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/course'
        'collections/result-courses'
        'collections/result-course-sections'
        'collections/result-sections'], ($,_, Backbone, SharkModel, Course, ResultCourses, ResultCourseSections, ResultSections) ->

  class SearchResults extends SharkModel

    url: '/search'

    defaults:
      query: ""
      courses: new ResultCourses

    initialize: ->
      Shark.schedule.bind 'load', =>
        @cleanResultsWithSchedule()
        @trigger 'search:complete'


    search: ($searchField) ->
    	## TODO ##
    	#
    	# apply any search filters that must be sent to server
    	#

      if not $searchField.val()
        return @trigger 'search:error', 'Must enter a query'
      if not Shark.term
        return @trigger 'search:error', 'Must select a term'

      @trigger 'search:start'
      @url = '/search?q='+$searchField.val()+'&t='+Shark.term.get('_id')+'&s='+Shark.school.id
      @set 'query', $searchField.val()
      @fetch success: () =>
        if @.get('error') is "No School"
          Shark.router.requireSchool () =>
            # Call self again once we have the school
            @.search($searchField)

        # Tracking
        mixpanel.track 'Search', Shark.config.asObject({
            query: @.get('query')
          , courseResultsCount: @.get('courses').length
          , sectionResultsCount: @.get('sections').length
          , queryTime: @.get('time')
        })
        @cleanResultsWithSchedule()

        # Anouce that the searchis complete
        @trigger 'search:complete'

        # Run the filters on the new results
        Shark.filterResults()


    cleanResultsWithSchedule: ->
      # Itterate over results to clean them up / prep them
      @get('courses').each (course) ->
        course.get('sections').each (section, i) ->
          # Add reference back to course into section
          # section.set('course', course)
          # If it exists in the schedule object, replace it with the schedule's version
          if Shark.schedule.contains(section)
            course.attributes.sections.models[i] = Shark.schedule.get('sections').get(section.get('_id'))
      return if not @get('sections')
      @get('sections').each (section) ->
        if Shark.schedule.contains(section)
          section = Shark.schedule.get('sections').get(section.id)

    #Parse method is part of the fetch command
    parse: (response) ->
    	# Turn the array of passed courses, into a ResultCourses collection
    	# Also map rank into the object as a property
    	response.courses = new ResultCourses response.courses.map (c) ->
        c.object.rank=c.rank
        # Turn the sections into a proper collection of sections
        c.object.sections = new ResultCourseSections c.object.sections
        #Return the new object piece of the {object: [course], rank: [number]} object
        c.object

      response.sections = new ResultSections response.sections.map (s) ->
        # Set the rank
        s.object.rank=s.rank
        # Set the course property to a course object
        s.object.course = new Course s.object.course
        # Return the object
        s.object
      response


  SearchResults
)