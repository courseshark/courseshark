(function(ex){
	var Term, School

	Term = function(){
		this.init(arguments[0])
		return this
	}
	Term.prototype.init = function(args){
		number = args[0]
		text = args[1]
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
	Department.prototype.init = function(args){
		abbr = args[0]
		text = args[1]
		this.abbr = abbr
		this.text = text
		this.courses = {}
	}
	Department.prototype.findOrAddCourseBySectionTitle = function(title){
		course = Course.createFromInfo(title)
		if (this.courses.hasOwnProperty(''+course)){
			return this.courses[''+course]
		}else{
			this.courses[''+course] = course
			return course
		}
	}

	Course = function(){
		this.init(arguments[0])
		return this
	}
	Course.prototype.init = function(args){
		this.title = args[0]
		this.number = args[1]
		this.sections = {}
	}
	Course.createFromInfo = function(title){
		pieces = title.split(' - ')
		title = pieces[0]
		number = pieces[2].match(/[0-9]+/)[0]
		return new Course({0:title, 1:number})
	}
	Course.prototype.addSectionFromInfo = function(title, details){
		section = Section.createFromInfo(title, details)
		this.sections[section.number] = section
		return section
	}
	Course.prototype.toString = function(){
		return ''+this.number
	}


	Section = function(){
		this.init(arguments[0])
		return this
	}
	Section.prototype.init = function(args){
		this.number = args[0]
		this.sectionId = args[1]
		this.timeslots = []
	}
	Section.createFromInfo = function(title, details){
		var pieces, number, sectionId, row, result
		pieces = title.split(' - ')
		number = pieces[1]
		sectionId = pieces[3]
		row=details.splice(0,7)
		result = new Section({0:number, 1:sectionId})
		while (row.length>1) {
			result.timeslots.push(Timeslot.createFromInfo(row))
			row=details.splice(0,7)
		}
		return result
	}


	Timeslot = function(){
		this.init(arguments[0])
		return this
	}
	Timeslot.prototype.init = function(args){
		this.days = args[0]
		this.starTime = args[1]
		this.endTime = args[2]
		this.type = args[3]
		this.location = args[4]
	}
	Timeslot.createFromInfo = function(details){
		timesString = details[1]
		dayString = details[2]
		locationString = details[3]
		datesString = details[4]
		typeString = details[5]

		// Split out days and convery to full name
		dayMap = {'M':'monday', 'T':'tuesday','W':'wednesday','R':'thursday','F':'friday','A':'saturday','S':'sunday'}
		dayNumbers = ['S','M','T','W','R','F','A']
		days = dayString.split('').map(function(d){return dayMap[d]})


		// Get the start datetime & end datetime
		dateParts = datesString.split(' - ')
		startDate = new Date(dateParts[0])
		if ( days.length > 1 ){
			// Adjust date to actual start day
			while (dayMap[dayNumbers[startDate.getDay()]] != days[0]){
				startDate.setDate(startDate.getDate()+1)
			}			
		}


		// Function to get am/pm to 0-23 hour format
		function toHour(time){
			var pieces = time.split(/\s|:/)
			if (pieces[2].toLowerCase() === 'pm' && pieces[0] !== '12'){
				return parseInt(pieces[0], 10)+12
			}else if (pieces[2].toLowerCase() === 'am' && pieces[0] === '12'){
				return 0;
			}else{
				return parseInt(pieces[0], 10)
			}
		}

		if ( timesString === 'TBA' ){
			startTime = startDate
			endTime = startDate
		}else{
			timeParts = timesString.split(' - ')

			startParts = timeParts[0].split(/\s|:/)
			startTime = new Date(startDate)
			startTime.setHours(toHour(timeParts[0]))
			startTime.setMinutes(parseInt(startParts[1], 10))

			endParts = timeParts[1].split(/\s|:/)
			endTime = new Date(startDate)
			endTime.setHours(toHour(timeParts[1]))
			endTime.setMinutes(parseInt(endParts[1], 10))
		}

		// Type string
		type = typeString.replace(/\*/g, '')

		return new Timeslot({0:days, 1:startTime, 2:endTime, 3:type, 4:locationString})
	}


	ex.Term = Term
	ex.Department = Department
})(exports);