define(['jQuery',
  'Underscore',
  'Backbone',
  'models/schedule'
  'text!tmpl/modals/new.ejs'], ($, _, Backbone, Schedule, newTemplate) ->

  class NewView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @newTemplate = _.template newTemplate
      @render()

    events:
      'click #do-new' : 'new'

    show: ->
      @$options.empty()
      Shark.terms.each (term) =>
        termText = term.get 'name'
        termText = termText.charAt(0).toUpperCase() + termText.slice 1
        termId = term.get '_id'
        @$options.append $('<option/>').val(termId).text(termText)
      @$el.modal 'show'

    hide: ->
      @$el.modal 'hide'

    new: ->
      # Close the modal
      @hide()
      # Tell the schedule object to essentially reset itself
      Shark.schedule.new()

      # Select the term chosen, defaulting to the current Term if none checked
      Shark.term = Shark.terms.where( _id: @$options.val() )[0] or Shark.school.get 'currentTerm'

    render: ->
      @$el.html @newTemplate()
      @$options = @$el.find '#term-list'
      ($ 'body').append @$el

  NewView
)