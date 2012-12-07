#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/index.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class SettingsView extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      ## Render
      @render() # Render out the view

      Shark.session.bind 'unauthenticated', ()=>
        Shark.router.navigate '', trigger: true

      Shark.session.bind 'authenticated', ()=>
        @render()

    # Renders the actual view from the template
    render: ->
      user = Shark.session.get('user') || new User()
      @$el.html $ @template user: user
      @ # Return self when done

    teardown: ->
      super()

  # Whatever is returned here will be usable by other modules
  SettingsView
)