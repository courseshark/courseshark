#Incude all the models here, then pass them back into the object
define(['jQuery',
  'Underscore',
  'Backbone',
  'views/modals/save',
  'views/modals/load',
  'views/modals/new'
  'text!/tmpl/app/nav.ejs'], ($, _, Backbone, SaveView, LoadView, NewView, templateText) ->

  class navView extends Backbone.View

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

    save: ->
      return Shark.session.login() if not Shark.session.authenticated()
      @saveView = new SaveView( el: (@$el.find '#save')[0] ).render()

    load: ->
      return Shark.session.login() if not Shark.session.authenticated()
      @loadView.show()

    new: ->
      @$el.find('#new').modal('show');
      @newView = new NewView( el: (@$el.find '#new')[0])

    print: ->
      console.log 'print clicked'

    link: ->
      console.log 'share link clicked'

    ical: ->
      console.log 'ical clicked'

    # Renders the actual view from the template
    render: ->
      @$el.html @template()
      @loadView = new LoadView()

  # Whatever is returned here will be usable by other modules
  navView
)