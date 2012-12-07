define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/modals/register.ejs'], ($,_, Backbone, SharkView, registerTemplate) ->

  class RegisterView extends SharkView

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @registerTemplate = _.template registerTemplate

    show: ->
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