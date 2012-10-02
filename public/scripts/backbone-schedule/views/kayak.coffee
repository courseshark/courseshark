define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/kayak/index.ejs',
        'text!/tmpl/kayak/section.ejs'], ($,_, Backbone, indexTemplate, sectionTemplate) ->

  class kayakView extends Backbone.View

    initialize: ->
      _.bindAll @

      @indexTemplate = _.template(indexTemplate)
      @sectionTemplate = _.template(sectionTemplate)
      console.log("laksdjflkajsdf")
      @render();

    render: ->
      console.log(@$el)
      @$el.html @indexTemplate()

  kayakView
)