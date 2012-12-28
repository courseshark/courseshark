define(['jQuery'
  'Underscore'
  'Backbone'
  'views/shark-view'
  'models/schedule'
  'text!tmpl/modals/new.ejs'], ($, _, Backbone, SharkView, Schedule, templateText) ->

  class NewView extends SharkView

    className: "modal hide"

    initialize: ->
      _.bindAll @
      @template = _.template templateText

    events:
      'click #do-new' : 'new'

    show: ->
      mixpanel.track 'New Dialog Open', Shark.config.asObject()
      @$el.html(@template()).appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @$options = @$el.find('#term-list').empty()
      Shark.terms.each (term) =>
        termText = term.get 'name'
        termText = termText.charAt(0).toUpperCase() + termText.slice 1
        termId = term.get '_id'
        @$options.append $('<option/>').val(termId).text(termText)
      @$el.modal 'show'

    hide: ->
      @$el.modal 'hide'

    new: ->
      # Tracking
      mixpanel.track 'New Schedule', Shark.config.asObject({term: @$options.val()})

      # Close the modal
      @hide()

      Shark.router.navigate '', trigger: false, replace: true

      # Tell the schedule object to essentially reset itself
      Shark.schedule.new()

      # Select the term chosen, defaulting to the current Term if none checked
      Shark.term = Shark.terms.where( _id: @$options.val() )[0] or Shark.school.get 'currentTerm'


  NewView
)