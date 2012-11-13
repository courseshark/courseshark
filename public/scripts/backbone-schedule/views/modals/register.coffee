define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/modals/register.ejs'], ($,_, Backbone, registerTemplate) ->

  class RegisterView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @registerTemplate = _.template registerTemplate
      @render()

    show: ->
      @list.empty()
      Shark.schedule.get('sections').each (section) =>
        console.log(section)
        @list.append $("<li></li>").text section.get('number')
        console.log(@list)
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')

    render: ->
      @$el.html @registerTemplate()
      @list = @$el.find('#register-crn-list')
      ($ 'body').append @$el


  RegisterView
)