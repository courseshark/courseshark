define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class Term extends SharkModel

    idAttribute: "_id"

  	default:
  		rank: 0

  Term
)