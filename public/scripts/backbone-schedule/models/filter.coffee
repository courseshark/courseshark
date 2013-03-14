define(['jQuery',
        'Underscore',
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class Filter extends SharkModel

    defaults:
      name: "Unnamed Filter"

    initialize: ->
    	@active = false

    # Logic section of the filter
   	filter: (section) ->
   		# Only set visibiltiy to false, never true
   		#  (no overriding other filter's choices, they are people too)
   		if false
   			section.set 'visible', false

   	# A global mapper for the filter
   	#  Takes in the course selection to map
    apply: (courseCollection) ->
    	if @active
    		courseCollection.map (course) =>
    			course.get('sections').map @filter
    			course.set('visible', false) if not (course.get('sections').where visible: true).length

    viewChange: (values) ->
      console.log values

  Filter
)