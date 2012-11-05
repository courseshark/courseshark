define(['jQuery',
  'Underscore',
  'Backbone',
  'models/schedule'
  'text!tmpl/modals/new.ejs'], ($, _, Backbone, Schedule, newTemplate) ->

  class NewView extends Backbone.View

    initialize: ->
      _.bindAll @
      @newTemplate = _.template newTemplate
      @render()

    events:
      'click #do-new' : 'new'

    new: ->
      Shark.schedule = new Schedule
      $options = @$el.find '#term-list'
      # Select the term chosen, defaulting to the current Term if none checked
      Shark.term = Shark.terms.where( _id: $options.val() )[0] or Shark.school.get 'currentTerm'
      # Close the modal
      @$el.modal 'hide'

    render: ->
      @$el.html @newTemplate()
      $list = @$el.find '#term-list'
      Shark.terms.each (term) =>
        termText = term.get 'name'
        termText = termText.charAt(0).toUpperCase() + termText.slice 1
        termId = term.get '_id'
        $list.append $('<option/>').val(termId).text(termText)

  NewView
)