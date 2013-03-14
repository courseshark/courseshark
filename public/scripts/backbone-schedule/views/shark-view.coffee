#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'], ($, _, Backbone) ->

  class SharkView extends Backbone.View
    teardown: ->
      @off()
      @remove()
      @undelegateEvents()
  SharkView
)