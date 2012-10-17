define(['jQuery',
        'Underscore',
        'Backbone',
        'views/schedule-section',
        'text!/tmpl/schedule/schedule-sections-list.ejs'], ($,_, Backbone, ScheduleSectionView, scheduleSectionsListTemplate) ->

  class ScheduleSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      @collection.bind "add", =>
        @render();

      @collection.bind "remove", =>
        @render();

      @scheduleSectionsListTemplate = _.template(scheduleSectionsListTemplate)

      @render();

    render: ->
      @$el.html $ @scheduleSectionsListTemplate()
      list = @$el.find('#schedule-sections-list-content')
      newList = $("<span><span>")
      _.each @collection.models, (scheduleSection) =>
        newList.append new ScheduleSectionView(model: scheduleSection.attributes).render().el
      list.html newList

  ScheduleSectionsListView
)