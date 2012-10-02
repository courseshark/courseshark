define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/kayak-sections-list/index.ejs',
        'text!/tmpl/kayak-sections-list/section.ejs'], ($,_, Backbone, indexTemplate, sectionTemplate) ->

  class kayakView extends Backbone.View
    el: $ '#app-container'

    initialize: ->
      _.bindAll @

      @indexTemplate = _.template(indexTemplate)
      @sectionTemplate = _.template(sectionTemplate)

    render: ->
      @$el.html @indexTemplate

  kayakView
)