define(['jQuery',
        'Underscore',
        'Backbone',
        'models/share-link'
        'text!tmpl/modals/share.ejs'], ($,_, Backbone, ShareLink, shareTemplate) ->

  class ShareView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      window._ = _
      _.bindAll @
      @linkWorks = false
      @template = _.template shareTemplate
      @render()

    show: ->
      $.ajax
        url:'/links'
        type: 'post'
        data:
          schedule: Shark.schedule.toJSON()
        dataType: 'json'
        success: (link)=>
          @$link.html link.hash

      @$el.modal 'show'

    hide: ->

      @$el.modal('hide')

    render: ->
      @$el.html @template()
      @$link = @$el.find('.urlHash')
      ($ 'body').append @$el


  ShareView
)