define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-courses'], ($,_, Backbone, ResultCourses) ->

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

    	@url = '/search?q='+$searchField.val()

    	@fetch()

    #Parse method is part of the fetch command
    parse: (response) ->
    	# Turn the array of passed courses, into a ResultCourses collection
    	# Also map rank into the object as a property
    	response.courses = new ResultCourses response.courses.map (c) ->
    		c.object.rank=c.rank
    		c.object
    	response

 
  SearchResults
)