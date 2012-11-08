define(
  [
    'jQuery','Underscore','Backbone', 'models/schedule', 'collections/schedules', 'models/session'#,
    # Include the views that need to be loaded for the router to use
    #'views/projects/list',
    #'views/users/list'
  ],
  ($, _, Backbone, Schedule, Schedules, Session) ->


    $.ajaxSetup statusCode:
      401: () ->
        # Redirect to the login
        Shark.session.login()
      403: () ->
        # Access denied
        # TODO Replace this with nice actual message box
        alert('You do not have permissions to preform that action.')

      500: () ->
        # Sys Error
        # TODO Replace this with nice actual message box
        alert('An error has occured. Please try again.')

    SharkRouter = Backbone.Router.extend(

      initialize: (Shark) ->
        @Shark = Shark
        Shark.router = @
        Shark.schedule = new Schedule
        Shark.schedulesList = new Schedules
        @Shark.currentView = new @Shark.views.appView()
        # Router Initilalized

      routes:
        ''  : 'landingPage'
        '/' : 'landingPage'
        '/s/' : 'landingPage'

        'login': 'login'
        'view':'view'
        'export': 'export'

        ':action':                   'defaultAction'
        ':controller/:action':       'defaultAction'
        ':controller/:action/:vid':  'defaultAction'


      landingPage: () =>
        if Shark.session.authenticated()
          Shark.schedulesList.fetch success: (newList) ->
            newList.load(newList.length-1)

      view: () =>
        @Shark.currentView.panelsView.showMaxCal()

      login: () ->
        if !Shark.session.authenticated()
          Shark.session.login()
        else
          @navigate '', trigger: false, replace: true

      export: ->
        console.log 'exporting'
        # Nagigate back but dont trigger router
        @navigate '', trigger: false, replace: true

      defaultAction: (actions) ->
        console.log 'No route', actions
        Shark.router.navigate '', trigger: true, replace: true
    )

    initialize = (Shark) ->
      Shark.session = new Session(CS.auth)
      router = new SharkRouter(Shark)
      Backbone.history.start pushState: true, root: CS.baseDir||''

      router

    initialize: initialize
)