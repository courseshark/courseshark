define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class Term extends SharkModel

    idAttribute: "_id"

  	defaults:
  		rank: 0

  Term
)