define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/search-results'
        'views/scheduler/result-course'
        'text!tmpl/scheduler/results/result-section-list.ejs'], ($,_, Backbone, SharkView, SearchResults, ResultsCourseView, templateText) ->

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

    showLoading: () ->
      @$courses.addClass 'loading'

    removeLoading: () ->
      @$courses.removeClass 'loading'

    renderResults: (eventName) ->
      @removeLoading()
      # Clear out the course result container
      @$courses.empty()
      # Draw the courses into the course result container
      @searchResults.get('courses').each (course) =>
        view = new ResultsCourseView model: course
        @subviews.push view
        @$courses.append view.render().el

    teardown: ->
      for view in @subviews
        view.teardown?()
      super()

  ResultListView
)