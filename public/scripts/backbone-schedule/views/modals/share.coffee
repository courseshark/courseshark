define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'models/share-link'
        'text!tmpl/modals/share.ejs'], ($,_, Backbone, SharkView, ShareLink, templateText) ->

  class ShareView extends SharkView

    className: "modal hide"

    initialize: ->
      window._ = _
      _.bindAll @
      @linkWorks = false
      @template = _.template templateText
      @render()

    show: ->
      # Tracing
      mixpanel.track 'Schedule Link', Shark.config.asObject()

      @$el.html(@template()).appendTo $ 'body'
      @delegateEvents()
      @$el.on 'hidden', =>
        @teardown()
      @$el.modal 'show'

      @$link = @$el.find('#share-link-result')
      @$linkText = @$link.find('.link-text')

      $.ajax
        url:'/links'
        type: 'post'
        data:
          schedule: Shark.schedule.toJSON()
        dataType: 'json'
        success: (link)=>
          if link.error
            @$linkText?.text 'Invalid Schedule. Cannot create link'
            @link?.attr '#'
            return
          @$link?.attr 'href', '/s/l/'+link.hash
          @$linkText?.text window.location.origin+'/s/l/'+link.hash

    hide: ->
      @$el.modal('hide')


  ShareView
)