#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/notifications/index.ejs'], ($, _, Backbone, SharkView, templateText) ->


  class NotificationsView extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      Shark.session.reloadUser @render

    # Renders the actual view from the template
    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @ # Return self when done

    teardown: ->
      super()

  # Whatever is returned here will be usable by other modules
  NotificationsView
)