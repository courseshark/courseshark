define(['jQuery'
        'Underscore'
        'Backbone'
        'views/shark-view'
        'text!tmpl/auth/duplicate.ejs'], ($,_, Backbone, SharkView, templateText) ->

  class ResolveDuplicateView extends SharkView

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @next = @options.next||()->return;
      @template = _.template templateText
      @render()

    events:
      'click #resolve-merge' : 'merge'

    merge: ->
      # Instant feedback by hiding modal
      @hide()
      Shark.session.doMerge(@model)

    show: ->
      @$el.modal 'show'
      @$el.on 'hidden', ()=>
        @next
        @teardown()

    hide: ->
      @$el.modal('hide')


    render: ->
      $.ajax
        url: '/user/merge-prompt'
        data: duplicate: @model.id
        success: (res) =>
          if res?.error is 'Not duplicates'
            @next()
            @remove()
          else
          @$el.html @template(me: res.me, found: res.found)
          ($ 'body').append @$el


  ResolveDuplicateView
)