define(['jQuery'
        'Underscore'
        'Backbone'
        'collections/schedules'
        'models/schedule'
        'models/session'
        'models/share-link'
        'views/app'], ($, _, Backbone, Schedules, Schedule, Session, ShareLink, AppView) ->

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

  class SharkRouter extends Backbone.Router

    initialize: () ->
      Shark.router = @
      Shark.appView = new AppView()
      Backbone.history.start pushState: true, root: CS.baseDir||''

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
      ''                  : 'scheduler'

      'home'              : 'home'

      'login'             : 'login'
      'view'              : 'view'

      'settings'          : 'settings'


      'l/:link'           : 'showLink'
      'l/:link/view'      : 'showLink'

      ':schedule'         : 'loadSchedule'
      ':schedule/view'    : 'view'

    home: () ->
      Shark.appView.show('home')

    scheduler: () ->
      Shark.appView.show('scheduler')
      if Shark.schedule.get('sections').length > 0
        Shark.view.panelsView.showMaxCal()
      else
        Shark.view.panelsView.hideMaxCal()

    settings: () ->
      Shark.appView.show('settings')

    view: (id) ->
      Shark.appView.show('scheduler')
      if id
        Shark.schedule.ensureScheduleLoaded id,
          success: ()->
            Shark.view.panelsView.showMaxCal()
          faulire: ()->
            Shark.router.navigate '', trigger: true, replace: true

    login: ->
      if !Shark.session.authenticated()
        Shark.session.login()
      else
        @navigate '', trigger: false, replace: true

    loadSchedule: (id) ->
      Shark.appView.show('scheduler')
      Shark.schedule.ensureScheduleLoaded id,
      success: ()=>
        if Shark.schedule.get('sections').length
          Shark.view.panelsView.showMaxCal()
      failure: ()=>
        @navigate '', trigger: true, replace: true

    showLink: (link) ->
      Shark.appView.show('scheduler')
      Shark.shareLink = new ShareLink hash: link
      Shark.shareLink.fetch
        success: ->
          Shark.shareLink.get('schedule').setLive()
          Shark.view.panelsView.showMaxCal()
        error: ->
          console.error "ERROR loading link"


    defaultAction: (actions) ->
      Shark.router.navigate '', trigger: true, replace: true

  SharkRouter
)