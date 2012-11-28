define(['jQuery'
        'Underscore'
        'Backbone'
        'models/user'], ($, _, Backbone, User) ->

  class Friends extends Backbone.Collection

    url: '/friends'
    model: User

  Friends
)