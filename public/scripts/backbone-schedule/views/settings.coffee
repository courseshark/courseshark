#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/settings/general'
        'views/settings/privacy'
        'models/user'
        'text!tmpl/settings/index.ejs'], ($, _, Backbone, SharkView, GeneralSettingsView, PrivacySettingsView, User, templateText) ->


  class SettingsView extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      Shark.session.reloadUser @render

      Shark.session.on 'unauthenticated', @goSchedule
      Shark.session.on 'authenticated', @render

    # Renders the actual view from the template
    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @$subViewContainer = @$el.find('#settings-container')
      if Backbone.history.getFragment().match /privacy/
        @showPrivacySettings()
      else
        @showGeneralSettings()
      @ # Return self when done

    events:
      'click #general-settings': 'showGeneralSettings'
      'click #privacy-settings': 'showPrivacySettings'

    renderSubview: (view) ->
      @subView?.teardown()
      @subView = view
      @$subViewContainer.html @subView.$el

    goSchedule: ->
      Shark.router.navigate '', trigger: true

    showGeneralSettings: ->
      @$el.find('.settings-nav li a').removeClass('chosen')
      @$el.find('#general-settings').addClass('chosen')
      Shark.router.navigate '/settings/general'
      @renderSubview new GeneralSettingsView

    showPrivacySettings: ->
      @$el.find('.settings-nav li a').removeClass('chosen')
      @$el.find('#privacy-settings').addClass('chosen')
      Shark.router.navigate '/settings/privacy'
      @renderSubview new PrivacySettingsView

    teardown: ->
      @subView?.teardown?()
      Shark.session.off 'unauthenticated', @goSchedule
      Shark.session.off 'authenticated', @render
      super()

  # Whatever is returned here will be usable by other modules
  SettingsView
)