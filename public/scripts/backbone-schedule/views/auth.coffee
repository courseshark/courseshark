define(['jQuery',
				'Underscore',
				'Backbone'], ($,_, Backbone, LoginDialogView) ->

	class AuthLoginView extends Backbone.View

		tagName: "div"

		className: "modal fade"

		events:
			"click .close": "close"

		initialize: ->
			_.bindAll @
			@render()

		render: ->
			require ['text!/login.tmpl'], (LoginDialogView) =>
				(@$el.html LoginDialogView).appendTo('body').modal 'show'

		close: ->
			@$el.modal 'hide'

	AuthLoginView
)