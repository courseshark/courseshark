define(['jQuery',
        'Underscore',
        'Backbone',
        'models/search-results'
        'views/result-course'
        'text!/tmpl/results/result-section-list.ejs'], ($,_, Backbone, SearchResults, ResultsCourseView, templateText) ->

  class ResultListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)

      @searchResults = new SearchResults
      Shark.searchResults = @searchResults
      
      @searchResults.bind 'change',  () => @render 'change'

      @render()

    render: (eventName) ->
      console.log 'rendering results b/c of',eventName,'event' if eventName
      @$el.html @template()

      @$courses = @$el.find('#course-results')

      @searchResults.get('courses').each (course) =>
        @$courses.append new ResultsCourseView(model: course).render().el

  ResultListView
)