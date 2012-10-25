define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'views/result-section'
        'text!/tmpl/results/result-section-list.ejs'], ($,_, Backbone, ResultSections, ResultSectionView, templateText) ->

  class ResultSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)

      @sections = new ResultSections
      Shark.resultSections = @sections
      

      @sections.bind 'update',  () => @render 'update'
      @sections.bind 'change',  () => @render 'change'
      @sections.bind 'add',     () => @render 'add'
      @sections.bind 'remove',  () => @render 'remove'
      @sections.bind 'reset',   () => @render 'reset'

      @sections.url = "/term/4ffd2365668b5416035b1361/sections/4ffd2367668b5416035b1a81"
      # Gets sections based on API endpoint specified in collection
      @sections.fetch
        success: (model, response) =>
          @render();

    render: ->
      @$el.html @template()
      _.each @sections.models, (section) =>
        @$el.append new ResultSectionView(model: section).render().el

  ResultSectionsListView
)