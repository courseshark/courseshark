define(['jQuery',
        'Underscore',
        'Backbone',
        'models/course',
        'views/scheduler/result-section'
        'text!tmpl/scheduler/results/result-course.ejs'], ($,_, Backbone, Course, ResultSectionView, templateText) ->

  class ResultCourseView extends Backbone.View

    model: Course

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @renderedSections = false
      @showingSections = false

      @model.bind 'change:visible', (section, visible) =>
        if not visible
          @$el.hide()
        else
          @$el.show()

    events:
      'click .course-info-row': 'toggleSections'

    toggleSections: ->
      #Render the sections if we havn't, then show them
      @renderSections() if not @renderedSections
      if @showingSections
        @$sectionContainer.slideUp duration: 100
        @showingSections = !@showingSections
      else
        @$sectionContainer.slideDown duration: 100
        @showingSections = !@showingSections


    renderSections: ->
      @$sections.empty()
      # Itterate over sections rendering their views
      @model.get('sections').each (section) =>
        @$sections.append (new ResultSectionView (model: section)).render().el

    render: ->
      params =
        name: @model.get 'name'
        departmentAbbr: @model.get('departmentAbbr')
        number: @model.get 'number'
      @$el.html @template params

      # Find pieces for later reference
      @$sectionContainer = @$el.find('.sections-container')
      @$sections = @$el.find('.sections-list')
      @ # Return the section view to be added by the results view

  ResultCourseView
)