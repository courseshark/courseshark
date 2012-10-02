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
      @$el.html @sectionTemplate(prof: "John T. Stasko", seats: "2/100", section_id: "84571: Section K")

  kayakView
)