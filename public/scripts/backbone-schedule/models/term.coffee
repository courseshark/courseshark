define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Term extends Backbone.Model

    idAttribute: "_id"

  	default:
  		rank: 0

  Term
)