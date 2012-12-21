define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/modals/save.ejs'], ($,_, Backbone, SharkView, templateText) ->

  class SaveView extends SharkView

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @template = _.template templateText

    events:
      'click #do-save' : 'save'

    save: ->


      # Instant feedback by hiding modal
      @hide()

      name = @$name.val()

      # Tracking
      mixpanel.track 'Save Schedule', Shark.config.asObject({name: name})

      Shark.schedule.unset '_id' if name != Shark.schedule.get 'name'
      Shark.schedule.set 'name', name
      Shark.schedule.set 'term', Shark.term
      Shark.schedule.save()

    show: ->
      mixpanel.track 'Save Dialog Show', Shark.config.asObject()
      @$el.html(@template()).appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @$name = @$el.find('#save-dialog-name-field').val(Shark.schedule.get('name'))
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')



  SaveView
)