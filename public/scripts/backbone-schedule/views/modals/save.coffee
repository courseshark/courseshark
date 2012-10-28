define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/modals/save.ejs'], ($,_, Backbone, saveTemplate) ->

  class SaveView extends Backbone.View

    initialize: ->
      _.bindAll @
      @saveTemplate = _.template(saveTemplate)
      @render()

    events:
      'click #do-save' : 'save'

    save: ->
      name = @$el.find('[name=savename]').val()
      Shark.schedule.set('name', name)
      found = Shark.schedulesList.where({name: name})

      if found[0]
        Shark.schedulesList.remove found[0]
      clone = Shark.schedule.makeClone()
      Shark.schedulesList.push clone

    render: ->
      @$el.html @saveTemplate()

  SaveView
)