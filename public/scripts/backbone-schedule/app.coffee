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
        'models/term'
        'models/schedule'
        'models/session'], ($, _, Backbone, Router, Friends, FriendInvites, Schools, Terms, Schedules, School, Term, Schedule, Session) ->

  class Shark extends Backbone.Model
    #All the router's initialize function
    initialize: ->
      window.Shark = @

      #Setup global Friends info
      @.friendsList = new Friends()
      @.friendInvites = new FriendInvites()
      @.sectionFriends = {}

      # Setup the session
      @.session = new Session()
      @.session.on 'authenticated', ()=>
        @.schedulesList.fetch()
        @.friendsList.fetch
          success: () =>
            @.friendsList.trigger('fetched')
        if @.school != @.session.get('user').get('school')
          @setSchool @.session.get('user').get('school')

        # Mixpanel tracking id user
        if mixpanel
          user = @.session.get 'user'
          mixpanel.identify user.id
          mixpanel.register
              "$email": user.get('email')
            , "$first_name": user.get('firstName')
            , "$last_name": user.get('lastName')
            , "$last_login": new Date()
            , "school": user.get('school')?.id or user.get('school') or @.school?.id
            , "referrer": document.referrer

          mixpanel.name_tag user.get('email') or user.get('name') or user.id
          mixpanel.track 'authenticated'
      @.session.on 'unauthenticated', () =>
        @.friendsList.reset()
        @.friendsList.trigger('unfetched')
        mixpanel.track 'unauthenticated'

      @.schools = new Schools(CS.schools)
      @.school = new School
      @.terms = new Terms
      @.schedulesList = new Schedules
      @.schedule = new Schedule

      if CS.school
        @.school = @.schools.get CS.school
        term = new Term @.school.get 'currentTerm'
        @.terms.add term
        @.term = term


      #Start the Auth session and the router
      @.session.start()
      @.router = new Router()

      # Lastly load Facebook scripts (safely)
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