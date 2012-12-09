define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/privacy.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class PrivacySettingsView extends SharkView

    className: 'row-fluid'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    teardown: ->
      super()

  PrivacySettingsView
)