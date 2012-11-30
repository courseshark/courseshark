define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'views/scheduler/calendar-mini-section'
        'text!tmpl/scheduler/results/result-section.ejs'], ($,_, Backbone, ResultsSections, CalendarMiniSectionView, templateText) ->

  class ResultSectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      @template = _.template(templateText)

      Shark.schedule.bind "load", =>
        @render()

      if not @model.resultView
        @model.resultView = @

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


    reset_add_button: ->
      @$addButton.removeClass('added')


    add: ->
      if Shark.schedule.contains(@model)
        Shark.schedule.removeSection(@model)
        @hoverOn()
      else
        Shark.schedule.addSection(@model)
        @$addButton.addClass('added')


    render: ->
      @$el.html @template
        prof: @model.get('instructor')
        seats: @model.get('seatsAvailable') + '/' + @model.get('seatsTotal')
        section_id: @model.get('number') + ': Section ' + @model.get('info')
        hours: @model.get('credits')
      @$el.hide() if not @model.get 'visible'
      @$addButton = @$el.find('.add')
      # Color/bold the correct day letters
      color = @model.color()
      _.each @model.get('timeslots'), (timeslot) =>
        _.each timeslot.days, (day) =>
          @$el.find('#' + day).addClass('selected').css 'color', color

      # Mark added if it is in the schedule?
      if Shark.schedule.contains(@model)
        @$addButton.addClass('added')
      @ # Return the section view to be added by the results view

  ResultSectionView
)