define(['jQuery',
        'Underscore',
        'Backbone',
        'text!/tmpl/results/section.ejs'], ($,_, Backbone, sectionTemplate) ->

  class sectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      @sectionTemplate = _.template(sectionTemplate)

      @render();

    events:
      'click .expander' : 'expand'
      'click .add' : 'add'

    expand: ->
      @$el.find('.details').slideToggle()
      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      @$el.find('.add').toggleClass('added')

    render: ->
      @$el.html @sectionTemplate(prof: "John T. Stasko", seats: "2/100", section_id: "84571: Section K")

  sectionView
)