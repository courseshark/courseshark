define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/modals/load.ejs'], ($,_, Backbone, SharkView, loadTemplate) ->

  class LoadView extends SharkView

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @loadTemplate = _.template loadTemplate

    events:
      'click #do-load' : 'load'

    load: ->
      toLoad = Shark.schedulesList.get(@list.val())
      Shark.router.navigate toLoad.id, trigger: true, replace: false
      # Tracked in router
      @.hide()

    show: ->
      mixpanel.track 'Load Dialog Open', Shark.config.asObject()
      @$el.html(@loadTemplate()).appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @list = @$el.find('#load-schedule-list').empty()
      Shark.schedulesList.fetch success: =>
        Shark.schedulesList.each (schedule) =>
          @list.append $("<option />").val(schedule.id).text(schedule.get 'name')
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')


  LoadView
)