define(['jQuery'
        'Underscore'
        'Backbone'], ($, _, Backbone) ->

  class FacebookFriendsResults extends Backbone.Collection

    # Determines order of sections in collection
    comparator: (user)->
      # Sort the sections based on section letter/number
      if user.get('name')
        user.get('name')
      else if user.get('id')
        user.get('id')

  FacebookFriendsResults
)