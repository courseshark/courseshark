define(['jQuery',
				'Underscore',
				'Backbone',
				'text!/tmpl/filters/slider-filter.ejs'], ($,_, Backbone, sliderFilterTemplate) ->

	class CheckboxFilterView extends Backbone.View

		initialize: ->
			_.bindAll @
			@sliderFilterTemplate = _.template(sliderFilterTemplate)
			@model.bind 'change:valueText', (filter, text) =>
				@$value.html(text) if @$value

		events: 
			'slidechange .slider' : 'updateModel'

		render: ->
			@$el.html @sliderFilterTemplate(@model.attributes)
			@$value = @$el.find('.value')
			@$slider = @$el.find('.slider')

			@$slider.slider @model.get 'sliderOptions'
			@updateModel()
			@

		updateModel: ->
			@model.viewChange @$slider.data('slider').options.values

	CheckboxFilterView
)