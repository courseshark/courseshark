define(['jQuery',
        'Underscore',
        'Backbone',
        'models/section'], ($,_, Backbone, Section) ->

  class Sections extends Backbone.Collection

    model: Section
    url: "/term/4ffd2365668b5416035b1361/sections/4ffd2367668b5416035b1a81"

  Sections
)