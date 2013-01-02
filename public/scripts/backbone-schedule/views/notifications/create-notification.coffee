#Incude all the models here, then pass them back into the object
define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/notifications/create-notification.ejs'
        'text!tmpl/notifications/create-notification-success.ejs'], ($, _, Backbone, SharkView, templateText, successTemplateText) ->

  class CreateNewNotificationView extends SharkView

    className: "modal hide"

    initialize: ->
      _.bindAll @
      @template = _.template templateText
      @successTemplate = _.template successTemplateText
      return Shark.session.login(@show) if not Shark.session.authenticated()
      @show()

    show: ->
      mixpanel.track 'New Notification Dialog', Shark.config.asObject()
      @$el.html @template
        section: @model
        user: Shark.session.get 'user'
        waitlist: @model.get('waitSeatsTotal') > 0

      @$el.appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @$options = @$el.find('#term-list').empty()
      @$el.modal 'show'

    hide: (options = {}) ->
      if options.success
        @$el.html @successTemplate
          section: @model
      else
        @$el.modal 'hide'

    events:
      'click #create': 'createNotification'



    createNotification: ->
      info =
        section: @model.id
        email: @$el.find('#email').val()
        phone: @$el.find('#phone').val()
        user: Shark.session.get('user').id
        school: Shark.school.id  ## Not nessisary but there for redundancy
        waitlist: !!@$el.find('#waitlist').attr('checked')

      @hide success: true

      $.ajax
        url:"/api/notifications"
        type: "POST"
        data: info
        success: (res) =>
          if res.error
            console.error res
          else
            Shark.notifications.fetch()


  # Whatever is returned here will be usable by other modules
  CreateNewNotificationView
)