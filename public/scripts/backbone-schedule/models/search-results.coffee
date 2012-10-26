define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-courses'
        'collections/result-sections'], ($,_, Backbone, ResultCourses, ResultSections) ->

  class SearchResults extends Backbone.Model

    defaults:
      query: ""
      courses: new ResultCourses

    url: '/search'

    search: ($searchField) ->

    	## TODO ##
    	#
    	# apply any search filters that must be sent to server
    	#
      @trigger 'search:start'
      @url = '/search?q='+$searchField.val()+'&t='+Shark.school.get('currentTerm').get('_id')
      @fetch success: () =>
        @trigger 'search:complete'


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