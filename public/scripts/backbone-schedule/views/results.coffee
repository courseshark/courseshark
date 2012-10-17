define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/sections'
        'views/section'], ($,_, Backbone, Sections, sectionView) ->

  class resultsView extends Backbone.View

    initialize: ->
      _.bindAll @

      @sections = new Sections
      @sections.url = "/term/4ffd2365668b5416035b1361/sections/4ffd2367668b5416035b1a81"
      # Gets sections based on API endpoint specified in collection
      @sections.fetch
        success: (model, response) =>
          @render();

    render: ->
      _.each @sections.models, (section) =>
         @$el.append new sectionView(model: section.attributes).render().el

  resultsView
)