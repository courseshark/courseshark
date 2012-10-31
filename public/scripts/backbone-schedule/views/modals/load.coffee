define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/modals/load.ejs'], ($,_, Backbone, loadTemplate) ->

  class LoadView extends Backbone.View

    initialize: ->
      _.bindAll @
      @loadTemplate = _.template loadTemplate 
      @render()

    events:
      'click #do-load' : 'load'

    load: ->
      loaded = Shark.schedulesList.getByCid(@$el.find('[name=loadlist]').val()[0])
      Shark.schedule.set('name', loaded.get('name'))
      Shark.schedule.loadSections(loaded.get('sections'))
      Shark.schedule.trigger('change')
      @$el.modal 'hide'

    render: ->
      @$el.html @loadTemplate()
      @list = @$el.find '[name=loadlist]' 
      _.each Shark.schedulesList.models, (schedule) =>
        @list.append $("<option />").val(schedule.cid).text(schedule.get('name'))

  LoadView
)