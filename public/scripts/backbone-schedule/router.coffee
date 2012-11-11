define(['jQuery'
        'Underscore'
        'Backbone'
        'models/schedule'
        'collections/schedules'
        'models/session'], ($, _, Backbone, Schedule, Schedules, Session) ->

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
      @Shark.currentView = new @Shark.views.appView()


    navigateRemove: (toRemove, navigateOptions={}) ->
      fragment = Backbone.history.getFragment()
      replaceRegExp = new RegExp('^'+toRemove+'\/?$|\/'+toRemove+'\/?$')
      newUrl = fragment.replace(replaceRegExp, '')
      if newUrl != fragment
        Shark.router.navigate newUrl, navigateOptions

    navigateAppend: (toAdd, navigateOptions={}) ->
      fragment = Backbone.history.getFragment()
      findRegExp = new RegExp('^'+toAdd+'\/?$|\/'+toAdd+'\/?$')
      newUrl =  if not fragment.match(findRegExp)
        Shark.router.navigate fragment + '/' + toAdd, navigateOptions

    routes:
      ''       : 'landingPage'

      'login'  : 'login'
      'view'   : 'view'

      ':schedule'        : 'loadSchedule'
      ':schedule/view'   : 'view'


    landingPage: () ->
      if Shark.schedule.get('sections').length > 0
        Shark.currentView.panelsView.showMaxCal()
      else
        Shark.currentView.panelsView.hideMaxCal()

    view: (id) ->
      if id
        Shark.schedule.ensureScheduleLoaded id,
          success: ()->
            Shark.currentView.panelsView.showMaxCal()
          faulire: ()->
            Shark.router.navigate '', trigger: true, replace: true

    login: () ->
      if !Shark.session.authenticated()
        Shark.session.login()
      else
        @navigate '', trigger: false, replace: true

    loadSchedule: (id) ->
      Shark.schedule.ensureScheduleLoaded id,
      success: ()=>
        if Shark.schedule.get('sections').length
          Shark.currentView.panelsView.showMaxCal()
      failure: ()=>
        @navigate '', trigger: true, replace: true

    defaultAction: (actions) ->
      console.log 'No route', actions
      Shark.router.navigate '', trigger: true, replace: true


  ) # End router

  initialize = (Shark) ->
    Shark.session = new Session(CS.auth)
    Shark.schedule = new Schedule
    Shark.schedulesList = new Schedules
    Shark.schedulesList.fetch() if Shark.session.authenticated()

    router = new SharkRouter(Shark)
    Backbone.history.start pushState: true, root: CS.baseDir||''
    router

  initialize: initialize
)