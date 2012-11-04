define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/modals/save.ejs'], ($,_, Backbone, saveTemplate) ->

  class SaveView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @saveTemplate = _.template saveTemplate
      @render()

    events:
      'click #do-save' : 'save'

    save: ->

      # Instant feedback by hiding modal
      @hide()

      name = @$name.val()
      Shark.schedule.unset '_id' if name != Shark.schedule.get 'name'
      Shark.schedule.set 'name', name
      Shark.schedule.save error: =>
        console.log '[error] Saving', arguments

    show: ->
      @$name.val(Shark.schedule.get('name'))
      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')

    render: ->
      @$el.html @saveTemplate()
      @$name = @$el.find('#save-dialog-name-field')
      ($ 'body').append @$el


  SaveView
)