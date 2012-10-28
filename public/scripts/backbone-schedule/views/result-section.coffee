define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'text!/tmpl/results/result-section.ejs'], ($,_, Backbone, ResultsSections, resultsSectionTemplate) ->

  class ResultSectionView extends Backbone.View

    initialize: ->
      _.bindAll @
      @resultsSectionTemplate = _.template(resultsSectionTemplate)

      @model.bind 'change:visible', (section, visible) =>
        if not visible
          @$el.hide()
        else 
          @$el.show()
      
    events:
      'click .expander' : 'expand'
      'click .add' : 'add'

    expand: ->
      @$el.find('.details').slideToggle()
      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      @$el.find('.add').toggleClass('added')
      collection = Shark.schedule.get("sections")
      if _.contains(collection.models, @model)
        collection.remove(@model)
      else
        collection.add(@model)

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
        @$el.find('.add').toggleClass('added')
      @ # Return the section view to be added by the results view

  ResultSectionView
)