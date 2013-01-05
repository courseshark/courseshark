define(['jQuery',
        'Underscore',
        'Backbone',
        'models/section'], ($,_, Backbone, Section) ->

  class ScheduleSections extends Backbone.Collection

    model: Section

    # # Determines order of sections in collection
    # comparator: (section)->
    #   # Sort the sections based on section letter/number
    #   section.attributes.info

    initialize: ->

      @conflictingList = []
      @conflictingMap = {} # map of section.id => list of sections it conflicts with ( both ways )
      @conflicting = false

      @on 'add', (section) =>
        @testConflicts 'add', section
      @on 'remove', (section) =>
        @testConflicts 'remove', section

    testConflicts: (mode, section=false) =>
      if @length <= 1
        @conflictingList = []
        @conflictingMap = {}

      else if mode is 'remove'
        return if not @conflicting
        return if section.id not in @conflictingList
        # Check the sections with which this one conflicts
        for sectionConflictedWith in @conflictingMap[section.id]
          # Remove this section from their confliction list
          @conflictingMap[sectionConflictedWith] = @conflictingMap[sectionConflictedWith].filter (id) -> id isnt section.id
          # If the list is now empty, they no longer conflict with anything
          if not @conflictingMap[sectionConflictedWith].length
            # so removed them from the conflicting list
            @conflictingList = @conflictingList.filter (id) -> id isnt sectionConflictedWith
        # Finally remove this section from the conflicting list
        @conflictingList = @conflictingList.filter (id) -> id isnt section.id
        @trigger 'change:conflictingList', @conflictingList, @
        @trigger 'change:conflictingMap', @conflictingMap, @
        #Now jump down to the conflicting state test with our new list


      else if mode is 'add'
        # Check if any existing sections conflict with the new one
        for sectionHave in @models
          # Sections cant conflict with themseleves so skip if we see ourself
          continue if sectionHave.id is section.id
          # Test if we conflict with this section
          if sectionHave.conflictsWith section
            # If we do, then add each to the list, and eachoter's conflicting map-lists
            @conflictingList.push sectionHave.id
            @conflictingList.push section.id
            @conflictingMap[sectionHave.id] = (@conflictingMap[sectionHave.id]?.push? section.id) or [section.id]
            @conflictingMap[section.id] = (@conflictingMap[section.id]?.push? sectionHave.id) or [sectionHave.id]
            @trigger 'change:conflictingList', @conflictingList, @
            @trigger 'change:conflictingMap', @conflictingMap, @
        # Now the new list is build so we will continue on to the state change test


      ## If we get here, we didnt return b/c of no conflicts,
      ## so check for change in conflict state
      if @conflictingList.length > 0
        if not @conflicting
          @conflicting = true
          @trigger 'change:conflicts', @conflicting
      else
        if @conflicting
          @conflicting = false
          @trigger 'change:conflicts', @conflicting

  ScheduleSections
)