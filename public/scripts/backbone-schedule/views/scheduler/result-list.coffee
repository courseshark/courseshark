define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/search-results'
        'views/scheduler/result-course'
        'views/scheduler/result-section-single'
        'text!tmpl/scheduler/results/no-results.ejs'
        'text!tmpl/scheduler/results/result-section-list.ejs'], ($,_, Backbone, SharkView, SearchResults, ResultsCourseView, ResultsSectionSingleView, noResultsTemplateText, templateText) ->

  # This is the main search-results View.
  #
  #  It handles the drawing of the results
  #  whenever the search object changes
  #
  class ResultListView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @noResultsTemplate = _.template noResultsTemplateText

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
      @$el.addClass 'loading'

    removeLoading: () ->
      @$el.removeClass 'loading'

    renderResults: (eventName) ->
      @removeLoading()
      # Clear out the course result container
      @$courses.empty().html @noResultsTemplate search: @searchResults.get 'query'
      @$sections.empty().html @noResultsTemplate search: @searchResults.get 'query'

      # Draw the courses into the course result container
      @$courses.empty() if @searchResults.get('courses').length
      @searchResults.get('courses').each (course) =>
        if course.get('rank') >= 0.3
          view = new ResultsCourseView model: course
          @subviews.push view
          @$courses.append view.render().el

      return if not @searchResults.get 'sections'
      @$sections.empty() if @searchResults.get('sections').length
      @searchResults.get('sections').each (section) =>
        if section.get('rank') >= 0.3
          view = new ResultsSectionSingleView model: section
          @subviews.push view
          @$sections.append view.render().el


    teardown: ->
      for view in @subviews
        view.teardown?()
      super()

  ResultListView
)