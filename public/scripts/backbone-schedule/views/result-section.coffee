define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'views/calendar-mini-section'
        'text!/tmpl/results/result-section.ejs'], ($,_, Backbone, ResultsSections, CalendarMiniSectionView, resultsSectionTemplate) ->

  class ResultSectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      Shark.schedule.bind "change", =>
        @render();

      @resultsSectionTemplate = _.template(resultsSectionTemplate)

      @model.bind 'change:visible', (section, visible) =>
        if not visible
          @$el.hide()
        else
          @$el.show()

    events:
      'click .expander' : 'expand'
      'click .add' : 'add'
      'mouseenter .results-section'   : 'hoverOn'
      'mouseleave .results-section'   : 'hoverOff'


    hoverOn: ->
      if not @model.miniCalView
        @model.miniCalView = new CalendarMiniSectionView model: @model 
      else
        @model.miniCalView.render()

      @model.miniCalView.setTemp true unless @model.miniCalView.temp is false
    hoverOff: ->
      @model.miniCalView.remove() if @model.miniCalView.temp



    expand: ->
      @$el.find('.details').slideToggle()
      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      if Shark.schedule.contains(@model)
        Shark.schedule.removeSection(@model)
      else
        Shark.schedule.addSection(@model)


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