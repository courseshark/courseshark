#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'text!tmpl/app/main-nav.ejs'], ($, _, Backbone, templateText) ->


  class MainNavView extends Backbone.View

    className: 'navbar navbar-fixed-top'

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @template = _.template(templateText)
      # Render call
      @render();

      Shark.session.on 'authenticated', ()=>
        @$el.html @template
          loggedIn: Shark.session.authenticated()
          user: Shark.session.get 'user'
          domain: CS.domain

    events:
      'click #nav-login': 'login'

    # Renders the actual view from the template
    render: ->
      @$el.html @template
          loggedIn: Shark.session.authenticated()
          user: Shark.session.get 'user'
          domain: CS.domain
      $('body').prepend @$el
      console.log(@$el)



    login: ->
      Shark.session.login()



  # Whatever is returned here will be usable by other modules
  MainNavView
)