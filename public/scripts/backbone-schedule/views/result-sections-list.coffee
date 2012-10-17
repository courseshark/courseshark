define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'views/result-section'], ($,_, Backbone, ResultSections, ResultSectionView) ->

  class ResultSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @sections = new ResultSections
      @sections.url = "/term/4ffd2365668b5416035b1361/sections/4ffd2367668b5416035b1a81"
      # Gets sections based on API endpoint specified in collection
      @sections.fetch
        success: (model, response) =>
          @render();

    render: ->
      _.each @sections.models, (section) =>
        @$el.append new ResultSectionView(model: section).render().el

  ResultSectionsListView
)