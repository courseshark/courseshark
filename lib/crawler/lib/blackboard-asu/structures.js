(function(ex){
  var structs
    , Term
    , School
    , Department
    , Course
    , Section
    , Timeslot
    , insertLeft = 0
    , EventEmitter = require("events").EventEmitter
    , emitter = new EventEmitter()
    , time = require('time')
    , dayMap = {'M':'monday', 'T':'tuesday','W':'wednesday','R':'thursday','F':'friday','S':'saturday','U':'sunday','O':'online'}
    , dayNumbers = ['U','M','T','W','R','F','S']
    , dayList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    , natural = require('natural')



  emitter.on('increaseCount', function(){
    insertLeft++
  })

  init = function(stru){
    structs = stru
  }

  function toHour(time){
    var pieces = time.match(/([0-9]+):([0-9]+)\s*([a-z]{2,})/i)
    if (pieces[3].toLowerCase() === 'pm' && pieces[1] !== '12'){
      return parseInt(pieces[1], 10)+12
    }else if (pieces[3].toLowerCase() === 'am' && pieces[1] === '12'){
      return 0;
    }else{
      return parseInt(pieces[1], 10)
    }
  }

  Term = function(){
    this.init(arguments[0])
    return this
  }
  Term.prototype.init = function(){
    number = arguments[0]
    text = arguments[1]
    this.number = number
    this.text = text

    yearMatch = this.text ? this.text.match(/[0-9]{2,4}/) : undefined
    this.year = yearMatch ? parseInt(yearMatch[0], 10) : undefined
    this.season = this.text ? this.text.replace(''+this.year,'').trim().toLowerCase() : undefined
    this.year += this.year<100 ? 2000 : 0
    return this
  }

  Department = function(){
    this.init(arguments[0])
    return this
  }
  Department.prototype.init = function(){
    abbr = arguments[0]
    text = arguments[1]
    this.abbr = abbr
    this.text = text
    this.courses = {}
  }
  Department.prototype.findOrAddCourseByNumber = function(number){
    var course
    if (!this.courses.hasOwnProperty(''+number)){
      course = new Course()
      course.number = number
      this.courses[''+number] = course
    }
    return this.courses[''+number]
  }

  Course = function(){
    this.title = 0
    this.number = 0
    this.sections = {}
    return this
  }
  Course.prototype.init = function(){
    this.title = arguments[0]
    this.number = arguments[1]
    this.sections = {}
    return this
  }
  Course.prototype.newSection = function(){
    return new Section()
  }
  Course.createFromInfo = function(titleString){
    var number = ((t=titleString.match(/[a-z]+\s([0-9]{3,}[a-z]*)/i)) && t.length===2) ? t[1] : '0'
    return (new Course()).init(titleString.split(' - ')[0],number)
  }
  Course.prototype.addSectionFromNumber = function(number){
    var section = new Section()
    section.number = number
    return this.sections[section.number] = section
  }
  Course.prototype.addSection = function(section){
    this.sections[section.number] = section
    return section
  }
  Course.prototype.toString = function(){
    return ''+this.number
  }


  Section = function(){
    this.number = 0
    this.credits = ""
    this.timeslots = []
    return this
  }
  Section.prototype.newTimeslot = function(){
    var slot = new Timeslot()
    this.timeslots.push(slot)
    return slot
  }


  Timeslot = function(){
    this.days = []
    this.startTime = ''
    this.endTime = ''
    this.location = ''
    this.endDate = ''
    return this
  }
  Timeslot.prototype.init = function(){
    return this
  }
  Timeslot.prototype.setDays = function(daysArray){
    if ( daysArray == "string" ){
      this.days = daysArray.split('').map(function(d){return dayMap[d]})
    }else{
      this.days = daysArray.map(function(d){ return dayList[d]; });
    }
    return this;
  }
  Timeslot.prototype.setStartDate = function(start){
    if (typeof start == "object"){
      this.startDate = start;
    }else{
      this.startDate = new time.Date(start, 'UTC')
      if ( this.days.length > 1 ){
        // Adjust date to actual start day
        while (this.days[0]!='online' && dayMap[dayNumbers[this.startDate.getDay()]] != this.days[0]){
          this.startDate.setDate(this.startDate.getDate()+1)
        }
      }
    }
    return this;
  }
  Timeslot.prototype.setEndDate = function(end){
    if (typeof end == "object"){
      this.endDate = end;
    }else{
      this.endDate = new time.Date(end, 'UTC')
    }
    return this;
  }
  Timeslot.prototype.setStartTime = function(start){
    if (typeof start == "object"){
      this.startTime = start;
    }else{
      var startParts = start.split(/\s|:/)
      this.startTime = new time.Date(this.startDate, 'UTC')
      this.startTime.setHours(toHour(start))
      this.startTime.setMinutes(parseInt(startParts[1].replace(/[a-z]+/gi, ''), 10))
    }
    return this;
  }
  Timeslot.prototype.setEndTime = function(end){
    if (typeof end == "object"){
      this.endTime = end;
    }else{
      var endParts = end.split(/\s|:/)
      this.endTime = new time.Date(this.startDate, 'UTC')
      this.endTime.setHours(toHour(end))
      this.endTime.setMinutes(parseInt(endParts[1].replace(/[a-z]+/gi, ''), 10))
    }
    return this;
  }
  Timeslot.createFromInfo = function(details){
    timesString = details[1]
    dayString = details[2]
    locationString = details[3]
    datesString = details[4]
    typeString = details[5]
    instructorString = details[6]

    // Split out days and convery to full name
    days = dayString.split('').map(function(d){return dayMap[d]})


    // Get the start datetime & end datetime
    dateParts = datesString.split(' - ')
    startDate = new time.Date(dateParts[0], 'UTC')
    if ( days.length > 1 ){
      // Adjust date to actual start day
      while (days[0]!='online' && dayMap[dayNumbers[startDate.getDay()]] != days[0]){
        startDate.setDate(startDate.getDate()+1)
      }
    }
    endDate = new time.Date(dateParts[1], 'UTC')

    // Function to get am/pm to 0-23 hour format
    function toHour(time){
      var pieces = time.match(/([0-9]+):([0-9]+)\s*([a-z]{2,})/i)
      if (pieces[3].toLowerCase() === 'pm' && pieces[1] !== '12'){
        return parseInt(pieces[1], 10)+12
      }else if (pieces[3].toLowerCase() === 'am' && pieces[1] === '12'){
        return 0;
      }else{
        return parseInt(pieces[1], 10)
      }
    }

    if ( timesString === 'TBA' || timesString === 'ONLINE'){
      startTime = startDate
      endTime = startDate
    }else{
      timeParts = timesString.split(' - ')

      startParts = timeParts[0].split(/\s|:/)
      startTime = new time.Date(startDate, 'UTC')
      startTime.setHours(toHour(timeParts[0]))
      startTime.setMinutes(parseInt(startParts[1].replace(/[a-z]+/gi, ''), 10))

      endParts = timeParts[1].split(/\s|:/)
      endTime = new time.Date(startDate, 'UTC')
      endTime.setHours(toHour(timeParts[1]))
      endTime.setMinutes(parseInt(endParts[1], 10))
    }

    // Type string
    type = typeString.replace(/\*/g, '')

    // Instructor String
    instructor = instructorString.replace(/\s*\([pP]\)/, '')

    return (new Timeslot()).init(days,startTime,endTime,type,locationString,instructor,endDate)
  }









  ex.init = init
  ex.Term = Term
  ex.Department = Department
  ex.Course = Course
  ex.Section = Section
  ex.Timeslot = Timeslot

})(exports);