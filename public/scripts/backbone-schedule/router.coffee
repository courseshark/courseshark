define(
  [
    'jQuery','Underscore','Backbone'#,
    # Include the views that need to be loaded for the router to use
    #'views/projects/list',
    #'views/users/list'
  ],
  ($, _, Backbone) ->

    SharkRouter = Backbone.Router.extend(

      initialize: (Shark) ->
        @Shark = Shark
        # Router Initilalized

      routes:
        '/s/' : 'landingPage'
        ''  : 'landingPage'
        '/' : 'landingPage'

        ':action':                   'defaultAction',
        ':controller/:action':       'defaultAction',
        ':controller/:action/:vid':  'defaultAction',


      landingPage: () =>
        console.log "Welcome to the landing page"
        @Shark.currentView = new @Shark.views.appView()


      defaultAction: (actions) ->
        @navigate '/' if actions is 's'
        console.log 'No route', actions
    )
    initialize = (Shark) ->
      router = new SharkRouter(Shark)
      Backbone.history.start pushState: true, root: CS.baseDir||''
      router

    initialize: initialize
)