define(['jQuery',
        'Underscore',
        'Backbone'
        'models/term'], ($,_, Backbone, Term) ->

  class School extends Backbone.Model

    idAttribute: "_id"
    url: '/school'

	  parse: (response) ->
	    response.currentTerm = new Term(response.currentTerm)
	    response

  School
)