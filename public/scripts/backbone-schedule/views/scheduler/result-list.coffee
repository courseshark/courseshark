define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/search-results'
        'views/scheduler/result-course'
        'views/scheduler/result-section'
        'text!tmpl/scheduler/results/result-section-list.ejs'], ($,_, Backbone, SharkView, SearchResults, ResultsCourseView, ResultsSectionView, templateText) ->

  # This is the main search-results View.
  #
  #  It handles the drawing of the results
  #  whenever the search object changes
  #
  class ResultListView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)

      @searchResults = new SearchResults
      Shark.searchResults = @searchResults

      @searchResults.bind 'search:start',  () => @showLoading()
      @searchResults.bind 'search:complete',  () => @renderResults()
      @searchResults.bind 'filter:start',  () => @showLoading()
      @searchResults.bind 'filter:complete',  () => @removeLoading()

      @subviews = []

      @render()


    render: () ->
      @$el.html @template()
      # Grab the course results container
      @$courses = @$el.find('#course-results')
      @$sections = @$el.find('#section-results')

    showLoading: () ->
      @$courses.addClass 'loading'
      @$sections.addClass 'loading'

    removeLoading: () ->
      @$courses.removeClass 'loading'
      @$sections.removeClass 'loading'

    renderResults: (eventName) ->
      @removeLoading()
      # Clear out the course result container
      @$courses.empty()
      @$sections.empty()
      # Draw the courses into the course result container
      @searchResults.get('courses').each (course) =>
        if course.get('rank') >= 0.3
          view = new ResultsCourseView model: course
          @subviews.push view
          @$courses.append view.render().el

      @searchResults.get('sections').each (section) =>
        if section.get('rank') >= 0.3
          view = new ResultsSectionView model: section
          console.log view, section
          @subviews.push view
          @$sections.append view.render().el
          console.log view.render().el


    teardown: ->
      for view in @subviews
        view.teardown?()
      super()

  ResultListView
)