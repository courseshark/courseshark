define(['jQuery'
        'Underscore'
        'Backbone'], ($,_, Backbone) ->

  class ResolveDuplicateView extends Backbone.View

    className: "modal hide fade"

    initialize: ->
      _.bindAll @
      @next = @options.next||()->return;

      #Lazy load the template to save space (since this is a rare occurance)
      require ['text!tmpl/auth/duplicate.ejs'], (template) =>
        @template = _.template template
        @render()

    events:
      'click #resolve-merge' : 'merge'

    merge: ->
      # Instant feedback by hiding modal
      @hide()
      $.ajax
        url: '/user/merge'
        data: duplicate: @model.id
        type: 'post'
        success: (res) =>
          console.log res

    show: ->
      @$el.modal 'show'
      @$el.on 'hidden', @next

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