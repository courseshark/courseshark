define(['jQuery',
  'Underscore',
  'Backbone',
  'models/schedule'
  'text!/tmpl/modals/new.ejs'], ($, _, Backbone, Schedule, newTemplate) ->

  class NewView extends Backbone.View

    initialize: ->
      _.bindAll @
      @newTemplate = _.template(newTemplate)
      @render()

    events:
      'click #do-new' : 'new'

    new: ->
      Shark.schedule = new Schedule
      Shark.term = Shark.terms.where( {_id: $('#term-list option:selected').val()} )[0]
      $('#new').modal('hide')

    render: ->
      @$el.html @newTemplate()
      Shark.terms.each (term) =>
        term_text = term.get('name')
        term_text = term_text.charAt(0).toUpperCase() + term_text.slice(1)
        @$el.find('#term-list').append $('<option />').val(term.get('_id')).text(term_text)

  NewView
)