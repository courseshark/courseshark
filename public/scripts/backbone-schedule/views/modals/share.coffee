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
          if link.error
            @$linkText.text 'Invalid Schedule. Cannot create link'
            @link.attr '#'
            return
          @$link.attr 'href', '/s/l/'+link.hash
          @$linkText.text window.location.origin+'/s/l/'+link.hash

      @$el.modal 'show'

    hide: ->
      @$el.modal('hide')

    render: ->
      @$el.html @template()
      @$link = @$el.find('#share-link-result')
      @$linkText = @$link.find('.link-text')
      ($ 'body').append @$el


  ShareView
)