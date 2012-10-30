define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'text!/tmpl/results/result-section.ejs'], ($,_, Backbone, ResultsSections, resultsSectionTemplate) ->

  class ResultSectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      Shark.schedule.bind "change", =>
        @render();

      @resultsSectionTemplate = _.template(resultsSectionTemplate)

    events:
      'click .expander' : 'expand'
      'click .add' : 'add'

    expand: ->
      @$el.find('.details').slideToggle()
      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      if Shark.schedule.contains(@model)
        Shark.schedule.removeSection(@model)
      else
        Shark.schedule.addSection(@model)
      @render()

    render: ->
      params =
        prof: @model.get('instructor')
        seats: @model.get('seatsAvailable') + '/' + @model.get('seatsTotal')
        section_id: @model.get('number') + ': Section ' + @model.get('info')
        hours: @model.get('credits')
      @$el.html @resultsSectionTemplate(params)
      # Color/bold the correct day letters
      _.each @model.get('timeslots'), (timeslot) =>
        _.each timeslot.days, (day) =>
          @$el.find('#' + day).addClass('selected')

      # Mark added if it is in the schedule?
      if _.contains(Shark.schedule.get('sections').models, @model)
        @$el.find('.add').addClass('added')
      @ # Return the section view to be added by the results view

  ResultSectionView
)