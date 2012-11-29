#Main Shark Application file

# Require the router here to help route urls
define(['jQuery'
        'Underscore'
        'Backbone'
        'router'
        'collections/friends'
        'collections/terms'
        'collections/schedules'
        'models/school'
        'models/schedule'
        'models/session'], ($, _, Backbone, Router, Friends, Terms, Schedules, School, Schedule, Session) ->

  class Shark extends Backbone.Model
    #All the router's initialize function
    initialize: ->
      window.Shark = @

      @.friendsList = new Friends()
      @.terms = new Terms(CS.terms)
      @.school = new School(CS.school)
      @.term = @.terms.get @.school.get 'currentTerm'

      @.schedule = new Schedule
      @.schedulesList = new Schedules

      @.session = new Session()
      @.session.on 'authenticated', ()=>
        @.schedulesList.fetch()
      @.session.start()

      @.router = new Router()

      window.FB or window.loadFacebook()
  Shark
)