define(['jQuery',
        'Underscore',
        'Backbone'], ($, _, Backbone) ->

  class Model extends Backbone.Model

    idAttribute: "_id"

    toJSON: ->
      res = {}
      # Calls toJSON recursively ( to remove circular references )
      for prop of @attributes
        if typeof @attributes[prop] is 'object'
          if typeof @attributes[prop]?.toJSON is 'function'
            res[prop] = _.clone(@attributes[prop].toJSON())
          else
            res[prop] = _.clone(@attributes[prop])
        else
          res[prop] = _.clone(@attributes[prop])
      return res;

  Model
)
