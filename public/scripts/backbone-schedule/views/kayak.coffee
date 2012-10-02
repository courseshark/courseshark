define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/kayak/list.ejs',
        'text!/tmpl/kayak/section.ejs'], ($,_, Backbone, listTemplate, sectionTemplate) ->

  class kayakView extends Backbone.View

    initialize: ->
      _.bindAll @

      @listTemplate = _.template(listTemplate)
      @sectionTemplate = _.template(sectionTemplate)

      @render();

    render: ->
      @$el.html @sectionTemplate(prof: "John T. Stasko")

  kayakView
)