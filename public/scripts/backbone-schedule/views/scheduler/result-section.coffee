define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'collections/result-sections'
        'views/scheduler/calendar-mini-section'
        'text!tmpl/scheduler/results/result-section.ejs'], ($,_, Backbone, SharkView, ResultsSections, CalendarMiniSectionView, templateText) ->

  class ResultSectionView extends SharkView

    initialize: ->
      _.bindAll @

      @template = _.template(templateText)

      Shark.schedule.bind "load", =>
        @render()

      if not @model.resultView
        @model.resultView = @

      @model.bind 'change:visible', (section, visible) =>
        if not visible
          @$el.hide()
        else
          @$el.show()


    events:
      'click .expander' : 'expand'
      'click .add' : 'add'
      'mouseenter .results-section'   : 'hoverOn'
      'mouseleave .results-section'   : 'hoverOff'


    hoverOn: ->
      if not @model.miniCalView
        @model.miniCalView = new CalendarMiniSectionView model: @model
      else
        @model.miniCalView.render()
      @model.miniCalView.setTemp true unless @model.miniCalView.temp is false


    hoverOff: ->
      @model.miniCalView.remove() if @model.miniCalView.temp


    expand: ->
      $el = @$el.find '.details'
      height = @originalHeight
      # height = $el.data "originalHeight"
      visible = $el.is ":visible"

      # if the bShow isn't present, get the current visibility and reverse it
      bShow = not visible
      # if the current visiblilty is the same as the requested state, cancel
      return false  if bShow is visible

      unless height
        # get original height
        height = $el.show().height()
        # update the height
        @originalHeight = height
        # if the element was hidden, hide it again
        $el.hide().css height: 0 unless visible

      # expand the knowledge (instead of slideDown/Up, use custom animation which applies fix)
      if bShow
        $el.show().animate height: height, 150
      else
        $el.animate height: 0, 150, ->
          $el.hide()

      @$el.find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up')



    reset_add_button: ->
      @$addButton.removeClass('added')


    add: ->
      if Shark.schedule.contains(@model)
        Shark.schedule.removeSection(@model)
        @hoverOn()
      else
        Shark.schedule.addSection(@model)
        @$addButton.addClass('added')


    render: ->
      @$el.html @template
        prof: @model.get('instructor')
        seats: @model.get('seatsAvailable') + '/' + @model.get('seatsTotal')
        section_id: @model.get('number') + ': Section ' + @model.get('info')
        hours: @model.get('credits')
        description: @model.description?()
      @$el.hide() if not @model.get 'visible'
      @$addButton = @$el.find('.add')

      # Color/bold the correct day letters
      color = @model.color()
      _.each @model.get('timeslots'), (timeslot) =>
        _.each timeslot.days, (day) =>
          @$el.find('#' + day).addClass('selected').css 'color', color

      # Adds friends heart/ images
      if friends = Shark.sectionFriends[@model.get('_id')]
        @$el.find('.friend-icon').show()
        @$el.find('.friends-row').show()

        $section_friends = @$el.find('.section-friends')
        _.each friends, (friend_id) =>
          friend = Shark.friendsList.get friend_id
          $section_friends.append($('<img class="friend-img" src="'+friend.get('avatar')+'"></img>')
            .tooltip(title: friend.get('firstName') + " " + friend.get('lastName')))

      # Mark added if it is in the schedule?
      if Shark.schedule.contains(@model)
        @$addButton.addClass('added')
      @ # Return the section view to be added by the results view

    teardown: ->
      @model.miniCalView?.teardown?()
      super()

  ResultSectionView
)