define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'collections/result-courses'
        'collections/result-sections'], ($,_, Backbone, SharkModel, ResultCourses, ResultSections) ->

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
      @trigger 'search:error', 'Must enter a query' if not $searchField.val()
      @trigger 'search:start'
      @url = '/search?q='+$searchField.val()+'&t='+Shark.term.get('_id')
      @set 'query', $searchField.val()
      @fetch success: () =>
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


    #Parse method is part of the fetch command
    parse: (response) ->
    	# Turn the array of passed courses, into a ResultCourses collection
    	# Also map rank into the object as a property
    	response.courses = new ResultCourses response.courses.map (c) ->
        c.object.rank=c.rank
        # Turn the sections into a proper collection of sections
        c.object.sections = new ResultSections c.object.sections
        #Return the new object piece of the {object: [course], rank: [number]} object
        c.object
      response


  SearchResults
)