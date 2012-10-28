define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Course extends Backbone.Model

  	defaults:
  		rank: 0
  		visible: true

  	initialize: ()->
  		@.get('sections').bind 'change:visible', (section) =>
  			@.trigger 'change:section-visibility', section
  
  Course
)