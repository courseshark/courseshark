#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/index.ejs'], ($, _, Backbone, SharkView, templateText) ->

  class HomeView extends SharkView

    className: 'home-view'

    initialize: ->
      _.bindAll @
      # Compile the template for future use
      @template = _.template(templateText)
      # Resize stuff
      @ticking = false
      @$window = $ window
      # Resize window listener
      @$window.on 'resize', @resizeEvent
      ## Render
      @render() # Render out the view

    events:
      'click .get-started': 'goSchedule'

    # Renders the actual view from the template
    render: ->
      @$el.html $ @template()
      @heightAdjust()
      @

    goSchedule: ->
      # Navigate to the scheduling page
      Shark.router.navigate '', {trigger: true}

    # Is called every time the window resizes
    resizeEvent: ->
      # If we are already in a loop, dont call rAF
      if not @ticking
        @ticking = true
        requestAnimFrame @heightAdjust
      else
        return

    # Actually readjusts the height of the view
    heightAdjust: ->
      # Window height minus top position of this element
      newHeight = @$window.height() -
                  @$el.position().top -
                  (parseInt(@$el.css('padding-top'),10)||0) -
                  (parseInt(@$el.css('padding-bottom'),10)||0)
      @$el.height newHeight
      console.log newHeight, @$window.height(), @$el, (parseInt(@$el.css('padding-top'),10)||0), (parseInt(@$el.css('padding-bottom'),10)||0)
      @ticking = false


    teardown: ->
      @$window.off 'resize', @resizeEvent
      super()
  # Whatever is returned here will be usable by other modules
  HomeView
)