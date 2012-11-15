define(['jQuery',
        'Underscore',
        'Backbone'
        'models/model'
        'models/term'], ($, _, Backbone, SharkModel, Term) ->

  class School extends SharkModel

    idAttribute: "_id"
    url: '/school'

	  parse: (response) ->
	    response.currentTerm = new Term(response.currentTerm)
	    response

  School
)