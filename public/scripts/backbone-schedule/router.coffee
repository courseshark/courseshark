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
        Shark.schedule = new Schedule
        Shark.schedulesList = new Schedules
        # Router Initilalized

      routes:
        ''  : 'landingPage'
        '/' : 'landingPage'
        '/s/' : 'landingPage'

        'login': 'login'
        'view':'view'

        ':action':                   'defaultAction'
        ':controller/:action':       'defaultAction'
        ':controller/:action/:vid':  'defaultAction'


      landingPage: () =>
        if Shark.session.authenticated()
          Shark.schedulesList.fetch success: (newList) ->
            newList.load(newList.length-1)
        @Shark.currentView = new @Shark.views.appView()

      view: () =>
        @Shark.currentView = new @Shark.views.appView().panelsView.showMaxCal()

      login: () ->
        if !Shark.session.authenticated()
          Shark.session.login()
        else
          @navigate '/s/', true

      defaultAction: (actions) ->
        @navigate '/' if actions is 's'
        console.log 'No route', actions
        @navigate '/'
    )

    initialize = (Shark) ->
      Shark.session = new Session(CS.auth)
      router = new SharkRouter(Shark)
      Backbone.history.start pushState: true, root: CS.baseDir||''

      router

    initialize: initialize
)