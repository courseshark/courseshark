define(['jQuery'
        'Underscore'
        'Backbone'
        'models/model'
        'models/school'], ($, _, Backbone, SharkModel, School) ->

  class User extends SharkModel

    idAttribute: "_id"

    url: '/user'

    defaults:
      avatar: 'http://www.gravatar.com/avatar/00000000000000000000000000000000'

    initialize: ->
      if !@.get('school')?.get
        if Shark.schools.get @.get('school')._id
          @.set 'school', Shark.schools.get @.get('school')._id
        else
          Shark.schools.add new School @.get 'school'
          @.set 'school', Shark.schools.get @.get('school')._id

    _crc32: (s="", polynomial=0x04C11DB7, initialValue=0xFFFFFFFF, finalXORValue=0xFFFFFFFF) ->
      s = String(s)
      crc = initialValue
      table = []

      reverse = (x, n) ->
        b = 0;
        while (n)
          b = b * 2 + x % 2
          x /= 2
          x -= x % 1
          n--
        b

      for i in [255..0]
        c = reverse(i, 32)
        for j in [0..7]
          c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0
        table[i] = reverse(c, 32)

      for i in [0..s.length-1]
        c = s.charCodeAt(i)
        if (c > 255)
          throw new RangeError()
        j = (crc % 256) ^ c
        crc = ((crc / 256) ^ table[j]) >>> 0

      (crc ^ finalXORValue) >>> 0

    __rnd: (seed = Date.now()) ->
      ((seed*9301+49297) % 263212) / (263212.0)

    color: (opacity=1) ->
      number=@_crc32(@.id)
      h = (@__rnd(number)*0x1000000<<0).toString(16)
      hex = (new Array(7-h.length)).join("0")+h
      red = parseInt(hex[0..1], 16)
      green = parseInt(hex[2..3], 16)
      blue = parseInt(hex[4..5], 16)
      'rgba('+red+','+green+','+blue+','+opacity+')'

  User
)