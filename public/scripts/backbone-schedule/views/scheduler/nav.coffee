#Incude all the models here, then pass them back into the object
define(['jQuery'
	'Underscore'
	'Backbone'
  'views/shark-view'
	'views/modals/save'
	'views/modals/load'
  'views/modals/new'
  'views/modals/share'
  'views/modals/register'
  'models/share-link'
  'text!tmpl/scheduler/nav.ejs'], ($, _, Backbone, SharkView, SaveView, LoadView, NewView, ShareView, RegisterView, ShareLink, templateText) ->


  class navView extends SharkView

    initialize: ->
      _.bindAll @

      # Compile the template for future use
      @template = _.template(templateText)

      # Render call
      @render();

    events:
      'click #save-button' : 'save'
      'click #load-button' : 'load'
      'click #new-button'  : 'new'
      'click #print-button': 'print'
      'click #link-button' : 'link'
      'click #ical-button' : 'ical'
      'click #register-button' : 'register'

    save: ->
      return Shark.session.login() if not Shark.session.authenticated()
      @saveView.show()

    load: ->
      return Shark.session.login() if not Shark.session.authenticated()
      @loadView.show()

    new: ->
      @newView.show()

    print: ->
      window.print()

    link: ->
      @shareView.show()

    ical: ->
      $('#ical-button').attr('href', Shark.schedule.export()).attr('download', Shark.schedule.get('name'));

    register: ->
      @registerView.show()

    # Renders the actual view from the template
    render: ->
      @$el.html @template()
      @loadView = new LoadView()
      @saveView = new SaveView()
      @newView  = new NewView()
      @shareView  = new ShareView()
      @registerView = new RegisterView()

    teardown: ->
      for view in [@loadView,@saveView,@newView,@shareView,@registerView]
        view.teardown?()
      super()

  # Whatever is returned here will be usable by other modules
  navView
)