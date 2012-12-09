define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/user'
        'text!tmpl/settings/general.ejs'], ($, _, Backbone, SharkView, User, templateText) ->


  class GeneralSettingsView extends SharkView

    className: 'row-fluid'

    initialize: ->
      _.bindAll @
      @template = _.template(templateText)
      @render()

    render: ->
      @$el.html $ @template user: Shark.session.get('user')
      @

    events:
      'click #edit-name' : 'showEditName'
      'click #edit-email' : 'showEditEmail'
      'click #edit-password' : 'showEditPassword'


    showEditName: ->
      console.log 'editName'
    showEditEmail: ->
      console.log 'editName'
    showEditPassword: ->
      console.log 'editName'

    teardown: ->
      super()

  GeneralSettingsView
)