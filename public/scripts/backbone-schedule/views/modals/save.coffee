define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/modals/save.ejs'], ($,_, Backbone, saveTemplate) ->

  class SaveView extends Backbone.View

    initialize: ->
      _.bindAll @
      @saveTemplate = _.template saveTemplate
      @render()

    events:
      'click #do-save' : 'save'

    save: ->

      # Instant feedback by hiding modal
      @$el.modal 'hide'

      name = @$name.val()
      Shark.schedule.set('name', name)
      found = Shark.schedulesList.where name: name

      if found[0]
        Shark.schedulesList.remove found[0]

      Shark.schedulesList.push Shark.schedule.makeClone()

    render: ->
      @$el.html @saveTemplate()
      @$name = @$el.find('#save-dialog-name-field')
      @$name.val(name) if Shark.schedule.get('name') not ''


  SaveView
)