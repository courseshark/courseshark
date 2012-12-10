#Main Shark Application file

# Require the router here to help route urls
define(['jQuery'
        'Underscore'
        'Backbone'
        'router'
        'collections/friends'
        'collections/friend-invites'
        'collections/schools'
        'collections/terms'
        'collections/schedules'
        'models/school'
        'models/term'
        'models/schedule'
        'models/session'], ($, _, Backbone, Router, Friends, FriendInvites, Schools, Terms, Schedules, School, Term, Schedule, Session) ->

  class Shark extends Backbone.Model
    #All the router's initialize function
    initialize: ->
      window.Shark = @

      @.session = new Session()
      @.session.on 'authenticated', ()=>
        @.schedulesList.fetch()
        @.friendsList.fetch()
        console.log @.school, @.session.get('user').get('school')
        if @.school != @.session.get('user').get('school')
          @setSchool @.session.get('user').get('school')
      @.session.on 'unauthenticated', () =>
        @.friendsList.reset()


      @.friendsList = new Friends()
      @.friendInvites = new FriendInvites()
      @.sectionFriends = {}

      @.schools = new Schools(CS.schools)
      @.school = new School
      @.terms = new Terms

      @.schedulesList = new Schedules
      @.schedule = new Schedule

      if CS.school
        @.school = @.schools.get CS.school
        console.log @.school
        term = new Term @.school.get 'currentTerm'
        @.terms.add term
        @.term = term


      @.session.start()
      @.router = new Router()

      window.FB or window.loadFacebook()

    setSchool: (school, next=(()->return)) ->
      @.school = school
      @.terms.fetch
        success: ()=>
          @.term = @.terms.get school.get('currentTerm').id
          @.schedule.set 'term', @.term
          next()

  Shark
)