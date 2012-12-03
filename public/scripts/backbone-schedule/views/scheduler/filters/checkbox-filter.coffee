define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/scheduler/filters/checkbox-filter.ejs'], ($,_, Backbone, checkboxFilterTemplate) ->

  class CheckboxFilterView extends Backbone.View

    initialize: ->
      _.bindAll @
      @checkboxFilterTemplate = _.template(checkboxFilterTemplate)

    events:
      'click .checkbox' : 'updateModel'

    render: ->
      @$el.html @checkboxFilterTemplate(@model.attributes)
      @

    updateModel: ->
      @model.viewChange @$el.find('.checkbox').map () -> ($ @).is(':checked')

  CheckboxFilterView
)