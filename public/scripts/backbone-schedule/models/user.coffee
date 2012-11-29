define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class User extends SharkModel

    idAttribute: "_id"

    defaults:
      avatar: 'http://www.gravatar.com/avatar/00000000000000000000000000000000'

  User
)