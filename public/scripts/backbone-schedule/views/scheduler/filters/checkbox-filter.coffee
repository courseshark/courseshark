define(['jQuery',
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/scheduler/filters/checkbox-filter.ejs'], ($,_, Backbone, SharkView, templateText) ->

  class CheckboxFilterView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template templateText

    events:
      'click .checkbox' : 'updateModel'

    render: ->
      @$el.html @template(@model.attributes)
      @

    updateModel: ->
      @model.viewChange @$el.find('.checkbox').map () -> ($ @).is(':checked')

  CheckboxFilterView
)