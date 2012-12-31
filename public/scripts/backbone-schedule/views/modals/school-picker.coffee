#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'views/modals/school-picker/option'
        'text!tmpl/modals/school-picker.ejs'], ($, _, Backbone, SharkView, SchoolPickOptionView, templateText) ->


  class SchoolPickerView extends SharkView


    className: "modal hide"

    initialize: (options)->
      _.bindAll @
      @next = options.next || (()->return)
      # Compile the template for future use
      @template = _.template(templateText)
      @subviews = []
      @render()

    events:
      'click #do-new' : 'new'

    render: ->
      @$el.html(@template()).appendTo $ 'body'
      @delegateEvents()
      @$el.modal 'show'
      @$el.on 'hidden', =>
        @checkAndHide()
      @showSchools()

    showSchools: ->
      @$options = @$el.find('#school-list').empty()
      next = ()=>
        @hide()
        @next()
      Shark.schools.each (school) =>
        view = new SchoolPickOptionView model: school, next: next
        @subviews.push view
        @$options.append view.$el

    hide: ->
      @$el.modal 'hide'


    checkAndHide: ->
      @teardown()
      if not Shark.school.id
        @render()

    events:
      'click .school': 'pickSchool'

    pickSchool: ->
      @next()

    teardown: ->
      _.each @subviews, (view)->
        view.teardown()
      super()

  # Whatever is returned here will be usable by other modules
  SchoolPickerView
)