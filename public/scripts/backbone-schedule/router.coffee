define(
  [
    'jQuery','Underscore','Backbone'#,
    # Include the views that need to be loaded for the router to use
    #'views/projects/list',
    #'views/users/list'
  ], 
  ($, _, Backbone, Session, projectListView, userListView) ->
    
    SharkRouter = Backbone.Router.extend(

      initialize: () ->
        # Router Initilalized

      routes: 
        '/projects':  'showProjects'
        '/users':    'showUsers'

        '' : 'landingPage'

        ':action':                   'defaultAction',
        ':controller/:action':       'defaultAction',
        ':controller/:action/:vid':  'defaultAction',


      landingPage: () ->
        # console.log "Welcome to the landing page"

      showProjects: () ->
        projectListView.render()

      showUsers: () ->
        userListView.render()

      defaultAction: (actions) ->
        console.log 'No route', actions
    )
    initialize = () ->
      router = new SharkRouter
      Backbone.history.start pushState: true, root: CS.baseDir||''
      router

    initialize: initialize
)