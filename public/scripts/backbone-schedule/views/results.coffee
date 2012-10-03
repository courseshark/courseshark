define(['jQuery',
        'Underscore',
        'Backbone',
        'views/section'
        'text!/tmpl/results/results.ejs'], ($,_, Backbone, sectionView, resultsTemplate) ->

  class resultsView extends Backbone.View

    initialize: ->
      _.bindAll @

      @resultsTemplate = _.template(resultsTemplate)

      @render();

    render: ->
      @$el.html @resultsTemplate()
      @sectionView = new sectionView( el: (@$el.find '#sections-frame')[0] )

  resultsView
)