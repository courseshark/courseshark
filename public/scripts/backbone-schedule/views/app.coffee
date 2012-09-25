#Incude all the models here, then pass them back into the object
define(['jQuery', 'Underscore', 'Backbone'], ($, _, Backbone) ->

	class appView extends Backbone.View
		el: $ 'body'

		initialize: ->
			_.bindAll @
			$('body').append('<h1>Hello World</h1>')
			console.log "Init"

	# Whatever is returned here will be usable by other modules
	appView
)