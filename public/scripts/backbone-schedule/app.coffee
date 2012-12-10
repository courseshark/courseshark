#Main Shark Application file
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

      # Setup the session
      @.session = new Session()
      @.session.on 'authenticated', ()=>
        @.schedulesList.fetch()
        @.friendsList.fetch()
      @.session.on 'unauthenticated', () =>
        @.friendsList.reset()

      #Setup global Friends info
      @.friendsList = new Friends()
      @.friendInvites = new FriendInvites()
      @.sectionFriends = {}

      # School and term setup
      @.schools = new Schools()
      @.terms = new Terms(CS.terms)
      @.school = new School(CS.school)
      @.schools.add @.school
      @.term = @.terms.get @.school.get 'currentTerm'

      # Schedule setup
      @.schedule = new Schedule term: @.term
      @.schedulesList = new Schedules

      #Start the Auth session and the router
      @.session.start()
      @.router = new Router()

      # Lastly load Facebook scripts (safely)
      window.FB or window.loadFacebook()
  Shark
)