define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/sections'
        'text!/tmpl/results/section.ejs'], ($,_, Backbone, Sections, sectionTemplate) ->

  class sectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      @sectionTemplate = _.template(sectionTemplate)

      @render();

    events:
      'click .expander' : 'expand'
      'click .add' : 'add'

    expand: ->
      @$el.find('.details').slideToggle()
      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      @$el.find('.add').toggleClass('added')
      collection = Shark.schedule.get("courses")
      if _.contains(collection.models, @model)
        collection.remove(@model)
      else
        collection.add(@model)

    render: ->
      model = @model.attributes
      params =
        prof: model.instructor
        seats: model.seatsAvailable + '/' + model.seatsTotal
        section_id: model.number + ': Section ' + model.info
        hours: model.credits
      @$el.html @sectionTemplate(params)
      # Color/bold the correct day letters
      _.each model.timeslots, (timeslot) =>
        _.each timeslot.days, (day) =>
          @$el.find('#' + day).addClass('selected')
      @ # Return the section view to be added by the results view

  sectionView
)