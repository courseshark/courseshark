define(['jQuery'
  'Underscore'
  'Backbone'
  'views/shark-view'
  'text!tmpl/modals/school-picker/option.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class NewView extends SharkView

    className: "school-option"

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @render()

    events:
      'click .choose' : 'choose'

    render: ->
      @$el.html @template school: @model

    choose: ->
      Shark.school = @model
      console.log 'setting school to', @model.get 'name'

  NewView
)