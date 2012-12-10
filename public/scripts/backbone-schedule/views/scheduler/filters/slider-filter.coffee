define(['jQuery'
				'Underscore'
				'Backbone'
				'views/shark-view'
				'text!tmpl/scheduler/filters/slider-filter.ejs'], ($,_, Backbone, SharkView, templateText) ->

	class CheckboxFilterView extends SharkView

		initialize: ->
			_.bindAll @
			@template = _.template(templateText)
			@model.bind 'change:valueText', (filter, text) =>
				@$value.html(text) if @$value

		events:
			'slidechange .slider' : 'updateModel'

		render: ->
			@$el.html @template(@model.attributes)
			@$value = @$el.find('.value')
			@$slider = @$el.find('.slider')

			@$slider.slider @model.get 'sliderOptions'
			@updateModel()
			@

		updateModel: ->
			@model.viewChange @$slider.data('slider').options.values

	CheckboxFilterView
)