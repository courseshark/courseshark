define(['jQuery',
				'Underscore',
				'Backbone',
				'text!/login.tmpl'], ($,_, Backbone, LoginDialogView) ->

	class AuthLoginView extends Backbone.View

		tagName: "div"

		className: "modal fade"

		events: 
			"click .close": "close"

		initialize: ->
			_.bindAll @
			@render()

		render: ->
			((@$el.html LoginDialogView).appendTo 'body').modal 'show'

		close: ->
			@$el.modal 'hide'

	AuthLoginView
)