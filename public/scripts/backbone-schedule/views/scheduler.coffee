#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/scheduler/nav'
        'views/scheduler/panels'
        'text!tmpl/scheduler/index.ejs'], ($, _, Backbone, SharkView, NavView, PanelsView, templateText) ->

  class SchedulerView extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      ## Render
      @render() # Render out the view


    events:
      'click #tutorial-frame': 'focusOnSearch'


    focusOnSearch: ->
      @panelsView.focusOnSearch()

    teardown: ->
      @navView?.teardown?()
      @panelsView?.teardown?()
      super()


    # Renders the actual view from the template
    render: ->
      @$el.html $ @template()
      @navView = new NavView( el: (@$el.children '.workspace-nav')[0] )
      @panelsView = new PanelsView( el: (@$el.children '.workspace-container')[0] )
      @ # Return self when done

  # Whatever is returned here will be usable by other modules
  SchedulerView
)