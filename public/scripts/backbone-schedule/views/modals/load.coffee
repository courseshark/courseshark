define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/modals/load.ejs'], ($,_, Backbone, loadTemplate) ->

  class LoadView extends Backbone.View

    initialize: ->
      _.bindAll @
      @loadTemplate = _.template(loadTemplate)
      @render()

    events:
      'click #do-load' : 'load'

    load: ->
      console.log("do load")

    render: ->
      console.log('render')
      @$el.html @loadTemplate()
      @list = @$el.find('[name=loadlist]')
      console.log(Shark.schedulesList)
      _.each Shark.schedulesList.models, (schedule) =>
        console.log(schedule)
        @list.append $("<option />").val(schedule.id).text(schedule.get('name'))
      # list.html options

  LoadView
)