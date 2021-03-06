define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/modals/register.ejs'], ($,_, Backbone, SharkView, templateText) ->

  class RegisterView extends SharkView

    className: "modal hide"

    initialize: ->
      _.bindAll @
      @template = _.template templateText

    show: ->
      mixpanel.track 'CRN Dialog Show', Shark.config.asObject({count: Shark.schedule.get('sections').length})
      @$el.html(@template()).appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @list = @$el.find('#register-crn-list').empty()
      Shark.schedule.get('sections').each (section) =>
        @list.append $("<li></li>").text section.get('number')
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')


  RegisterView
)