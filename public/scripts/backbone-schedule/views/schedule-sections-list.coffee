define(['jQuery',
        'Underscore',
        'Backbone',
        'views/schedule-section',
        'text!/tmpl/schedule/schedule-sections-list.ejs'], ($,_, Backbone, ScheduleSectionView, scheduleSectionsListTemplate) ->

  class ScheduleSectionsListView extends Backbone.View

    initialize: ->
      _.bindAll @

      console.log(@collection)
      @collection.bind "change", =>
        @render();

      @scheduleSectionsListTemplate = _.template(scheduleSectionsListTemplate)

      @render();

    render: ->
      console.log('sslv render')
      collection = @collection.get('sections')
      console.log(collection)
      @$el.html $ @scheduleSectionsListTemplate()
      list = @$el.find('#schedule-sections-list-content')
      newList = $("<span><span>")
      _.each collection.models, (scheduleSection) =>
        newList.append new ScheduleSectionView(model: scheduleSection.attributes).render().el
      list.html newList

  ScheduleSectionsListView
)