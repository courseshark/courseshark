define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'], ($, _, Backbone, SharkModel) ->

  class User extends SharkModel

    idAttribute: "_id"

  User
)