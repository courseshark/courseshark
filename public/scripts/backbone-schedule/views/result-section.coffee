define(['jQuery',
        'Underscore',
        'Backbone',
        'collections/result-sections'
        'views/calendar-mini-section'
        'text!tmpl/results/result-section.ejs'], ($,_, Backbone, ResultsSections, CalendarMiniSectionView, resultsSectionTemplate) ->

  class ResultSectionView extends Backbone.View

    initialize: ->
      _.bindAll @

      @resultsSectionTemplate = _.template(resultsSectionTemplate)

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
      @$el.find('.details').slideToggle()
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
      params =
        prof: @model.get('instructor')
        seats: @model.get('seatsAvailable') + '/' + @model.get('seatsTotal')
        section_id: @model.get('number') + ': Section ' + @model.get('info')
        hours: @model.get('credits')

      @$el.html @resultsSectionTemplate(params)
      @$el.hide() if not @model.get 'visible'
      @$addButton = @$el.find('.add')

      # Color/bold the correct day letters
      color = @model.color()
      _.each @model.get('timeslots'), (timeslot) =>
        _.each timeslot.days, (day) =>
          @$el.find('#' + day).addClass('selected').css 'color', color

      # Adds friends heart/ images
      if Shark.sectionFriends[@model.get('_id')]
        @$el.find('.friend-icon').show()

        friends = Shark.sectionFriends[@model.get('_id')]
        $section_friends = @$el.find('.section-friends')
        _.each friends, (friend) =>
          imgUrl = Shark.friendsList.where('_id' : friend)[0].get('avatar')
          $section_friends.append('<img class="friend-img" src="'+imgUrl+'"></img>')


      # Mark added if it is in the schedule?
      if Shark.schedule.contains(@model)
        @$addButton.addClass('added')
      @ # Return the section view to be added by the results view

  ResultSectionView
)