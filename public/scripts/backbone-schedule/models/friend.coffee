define(['jQuery',
        'Underscore',
        'Backbone'], ($,_, Backbone) ->

  class Friend extends Backbone.Model

    idAttribute: "_id"

  	defaults:
  		name: "Bob"

  Friend
)