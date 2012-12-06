#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'models/user'
        'text!tmpl/settings/index.ejs'], ($, _, Backbone, User, templateText) ->

  class SettingsView extends Backbone.View

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
      @$el.html $ @template user: new User(Shark.session.get('user'))
      @ # Return self when done



  # Whatever is returned here will be usable by other modules
  SettingsView
)