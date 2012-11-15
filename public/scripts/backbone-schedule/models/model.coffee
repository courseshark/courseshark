define(['jQuery',
        'Underscore',
        'Backbone'], ($, _, Backbone) ->

  class Model extends Backbone.Model

    idAttribute: "_id"

    toJSON: ->
      res = {}
      for prop of @attributes
        if typeof @attributes[prop] is 'object'
          if typeof @attributes[prop].toJSON is 'function'
            console.log 'calling recurse from', @, 'on', prop
            res[prop] = _.clone(@attributes[prop].toJSON())
          else
            res[prop] = _.clone(@attributes[prop])
        else
          res[prop] = _.clone(@attributes[prop])
      return res;

  Model
)
