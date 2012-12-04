#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'text!tmpl/app/nav/account-dropdown.ejs'], ($, _, Backbone, templateText) ->

  class AccountDropdownView extends Backbone.view

    initialize: ->
      _.bindAll @

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').appendTo 'body'
      else
        @$el = $('#dropdown-view').empty()

      @template = _.template templateText
      @render()

    render: ->
      @$el.html @template user: Shark.session.get 'user'
      @show()

    events:
      'click .close' : 'hide'
      'click #nav-act-logout' : 'logout'

    show: ->
      @$el.show()
      $('#app-container').on 'click', @hide

    hide: ->
      $('#app-container').off 'click', @hide
      @$el.hide()


    ## Actual Actions found in menu
    logout: ->
      Shark.session.logout()
      @hide()

  # Whatever is returned here will be usable by other modules
  AccountDropdownView
)