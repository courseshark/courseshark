define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class GeneralSettingsView extends SharkView

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    teardown: ->
      super()

  GeneralSettingsView
)