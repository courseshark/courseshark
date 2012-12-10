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
        'models/schedule'
        'models/session'], ($, _, Backbone, Router, Friends, FriendInvites, Schools, Terms, Schedules, School, Schedule, Session) ->

  class Shark extends Backbone.Model
    #All the router's initialize function
    initialize: ->
      window.Shark = @

      @.session = new Session()
      @.session.on 'authenticated', ()=>
        @.schedulesList.fetch()
        @.friendsList.fetch()
      @.session.on 'unauthenticated', () =>
        @.friendsList.reset()


      @.friendsList = new Friends()
      @.friendInvites = new FriendInvites()
      @.sectionFriends = {}

      @.schools = new Schools()
      @.terms = new Terms(CS.terms)
      @.school = new School(CS.school)
      @.schools.add @.school
      @.term = @.terms.get @.school.get 'currentTerm'

      @.schedule = new Schedule term: @.term
      @.schedulesList = new Schedules

      @.session.start()
      @.router = new Router()

      window.FB or window.loadFacebook()
  Shark
)