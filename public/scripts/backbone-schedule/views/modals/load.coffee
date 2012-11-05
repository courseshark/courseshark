define(['jQuery',
        'Underscore',
        'Backbone',
        'text!tmpl/modals/load.ejs'], ($,_, Backbone, loadTemplate) ->

  class LoadView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @loadTemplate = _.template loadTemplate
      @render()

    events:
      'click #do-load' : 'load'

    load: ->
      toLoad = Shark.schedulesList.get(@list.val())
      toLoad.load()
      @.hide()

    show: ->
      @list.empty()
      Shark.schedulesList.each (schedule) =>
        @list.append $("<option />").val(schedule.id).text(schedule.get 'name')
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')

    render: ->
      @$el.html @loadTemplate()
      @list = @$el.find '#load-schedule-list'
      ($ 'body').append @$el

  LoadView
)