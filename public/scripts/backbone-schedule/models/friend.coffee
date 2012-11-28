define(['jQuery',
        'Underscore',
        'Backbone'
        'models/user'], ($,_, Backbone, User) ->

  class Friend extends User

    idAttribute: "_id"

  	defaults:
  		name: "Bob"

  Friend
)