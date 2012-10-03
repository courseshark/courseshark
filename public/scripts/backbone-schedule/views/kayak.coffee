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

    events:
      'click .expander' : 'expand'
      'click .add' : 'add'

    expand: ->
      target = ($ event.target)
      target.parent().toggleClass('expanded').children('.details').toggle()
      target.children('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')

    add: ->
      target = ($ event.target)
      target.toggleClass('added')

    render: ->
      console.log(@$el);
      @$el.html @sectionTemplate(prof: "John T. Stasko", seats: "2/100", section_id: "84571: Section K")

  kayakView
)