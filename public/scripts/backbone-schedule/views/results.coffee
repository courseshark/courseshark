define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/sections'
        'views/section'], ($,_, Backbone, Sections, sectionView) ->

  class resultsView extends Backbone.View

    initialize: ->
      _.bindAll @

      @sections = new Sections
      # Gets sections based on API endpoint specified in collection
      @sections.fetch
        success: (model, response) =>
          @render();

    render: ->
      _.each @sections.models, (section) =>
         @$el.append new sectionView(model: section.attributes).render().el

  resultsView
)