#Incude all the models here, then pass them back into the object
define(['jQuery'
  'Underscore'
  'Backbone'
  'text!tmpl/app/nav/main-nav-loggedIn.ejs'
  'text!tmpl/app/nav/main-nav-loggedOut.ejs'], ($, _, Backbone, templateTextLoggedIn, templateTextLoggedOut) ->


  class MainNavView extends Backbone.View

    className: 'navbar navbar-fixed-top'

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @templateLoggedIn = _.template(templateTextLoggedIn)
      @templateLoggedOut = _.template(templateTextLoggedOut)
      # Render call
      @render()

      Shark.session.on 'authenticated', ()=>
        @$el.html @templateLoggedIn
          user: Shark.session.get 'user'
          domain: CS.domain

      Shark.session.on 'unauthenticated', ()=>
        @$el.html @templateLoggedOut
          domain: CS.domain

    events:
      'click #nav-login': 'login'
      'click .user-icon': 'showUserMenu'

    # Renders the actual view from the template
    render: ->
      if Shark.session.authenticated()
        @$el.html @templateLoggedIn
          user: Shark.session.get 'user'
          domain: CS.domain
      else
        @$el.html @templateLoggedOut
          domain: CS.domain


    login: ->
      Shark.session.login()

    showUserMenu: ->
      Shark.session.logout()
      #@$el.find('#user-menu').toggleClass('open');


  # Whatever is returned here will be usable by other modules
  MainNavView
)