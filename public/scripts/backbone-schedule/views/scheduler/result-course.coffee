define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/course'
        'views/scheduler/result-section'
        'text!tmpl/scheduler/results/result-course.ejs'], ($,_, Backbone, SharkView, Course, ResultSectionView, templateText) ->

  class ResultCourseView extends SharkView

    model: Course

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @renderedSections = false
      @showingSections = false

      @subviews= []

      Shark.friendsList.bind 'fetched', @updateFriendStatus
      Shark.friendsList.bind 'unfetched', @updateFriendStatus

      @model.bind 'change:visible', (section, visible) =>
        if not visible
          @$el.hide()
        else
          @$el.show()

    events:
      'click .course-info-row': 'toggleSections'

    toggleSections: ->
      #Render the sections if we havn't, then show them
      @renderSections() if not @renderedSections
      if @showingSections
        @$sectionContainer.slideUp duration: 100
        @showingSections = !@showingSections
      else
        @$sectionContainer.slideDown duration: 100
        @showingSections = !@showingSections


    renderSections: ->
      @renderedSections = true
      @$sections.empty()
      # Itterate over sections rendering their views
      @model.get('sections').each (section) =>
        section.set 'courseDescription', @model.get('description')
        view = new ResultSectionView (model: section)
        @subviews.push view
        @$sections.append view.render().el

      #Update the sections seat information
      if Shark.config.can('useWebsockets')
        @model.get('sections').each (section) ->
          Shark.sockets.seats.emit('update', section.id)
      else
        sectionIds = @model.get('sections').map((d) -> return d.id).join(',')
        $.ajax
          url: '/api/seats/'+sectionIds
          success: (res) =>
            for info in res
              section = @model.get('sections').get(info.id)
              for prop, val of info
                if prop isnt 'id'
                  section.set prop, val
              section.trigger 'seatsUpdated'


    render: ->
      departmentAbbr = @model.get('departmentAbbr') or @model.get('sections').at(0)?.get('name').match(/^([a-z]+)\s/i)?[1]
      params =
        name: @model.get 'name'
        departmentAbbr: departmentAbbr.toUpperCase()
        number: @model.get 'number'
      @$el.html @template params

      # Since friends schedules don't have courses, we have to do it here for now
      @model.get('sections').each (section) =>
        if Shark.sectionFriends[section.get('_id')]
          @$el.find('.friend-icon').show()

      # Find pieces for later reference
      @$sectionContainer = @$el.find('.sections-container')
      @$sections = @$el.find('.sections-list')
      @ # Return the section view to be added by the results view


    updateFriendStatus: ->
      $friendIcon = @$el.find('.friend-icon').hide()
      @model.get('sections').each (section) =>
        if Shark.sectionFriends[section.get('_id')]
          $friendIcon.show()

    teardown: ->
      Shark.friendsList.bind 'fetched', @updateFriendStatus
      Shark.friendsList.bind 'unfetched', @updateFriendStatus
      for view in @subviews
        view.teardown?()
      super()

  ResultCourseView
)