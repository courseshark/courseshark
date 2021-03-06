#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/app/nav/dropdowns/account.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class AccountDropdownView extends SharkView

    initialize: ->
      _.bindAll @

      if not $('#dropdown-view').length
        @$el = $('<div></div>').attr('id', 'dropdown-view').css(top:50).appendTo 'body'
      else
        @$el = $('#dropdown-view').attr('style', '')

      @template = _.template templateText
      @render()

    render: ->
      @$el.html @template user: Shark.session.get 'user'
      @$el.css right: '10px'
      @show()

    events:
      'click .close' : 'hide'
      'click #nav-act-logout' : 'logout'
      'click #nav-act-settings': 'showSettings'
      'click #nav-act-schedules': 'showSchedules'


    show: ->
      @$el.show()
      $('#app-container').on 'click', @hide

    hide: ->
      $('#app-container').off 'click', @hide
      @teardown()


    ## Actual Actions found in menu

    showSchedules: ->
      @hide()
      Shark.router.navigate '', trigger: true

    logout: ->
      Shark.session.logout()
      @hide()

    showSettings: ->
      @hide()
      Shark.router.navigate 'settings', trigger: true

  # Whatever is returned here will be usable by other modules
  AccountDropdownView
)