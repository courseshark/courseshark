define(
  [
    'jQuery','Underscore','Backbone', 'models/schedule'#,
    # Include the views that need to be loaded for the router to use
    #'views/projects/list',
    #'views/users/list'
  ],
  ($, _, Backbone, Schedule) ->


    $.ajaxSetup statusCode:
                  401: () ->
                    # Redirect to the login
                    window.location.replace('#login');
                  403: () ->
                    # Access denied
                    window.location.replace('#denied');

    SharkRouter = Backbone.Router.extend(

      initialize: (Shark) ->
        @Shark = Shark
        Shark.schedule = new Schedule
        # Router Initilalized

      routes:
        '/s/' : 'landingPage'
        ''  : 'landingPage'
        '/' : 'landingPage'

        ':action':                   'defaultAction',
        ':controller/:action':       'defaultAction',
        ':controller/:action/:vid':  'defaultAction',


      landingPage: () =>
        console.log "Initilalized"
        @Shark.currentView = new @Shark.views.appView()

      defaultAction: (actions) ->
        @navigate '/' if actions is 's'
        console.log 'No route', actions
        @navigate '/'
    )
    initialize = (Shark) ->
      router = new SharkRouter(Shark)
      Backbone.history.start pushState: true, root: CS.baseDir||''
      router

    initialize: initialize
)