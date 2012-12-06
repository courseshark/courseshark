define(['jQuery',
        'Underscore',
        'Backbone'
        'models/user'], ($,_, Backbone, User) ->

  class Friend extends User

    idAttribute: "_id"

  	defaults:
      firstName: "Friend"
      lastNamme: ""
      confirmed: false
      something: 'new'

  Friend
)