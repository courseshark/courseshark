(function(ex){
	var structs
		,	Term
		,	School
		, Department
		, Course
		, Section
		, Timeslot
		, insertLeft = 0
		, EventEmitter = require("events").EventEmitter
		,	emitter = new EventEmitter()


	emitter.on('increaseCount', function(){
		insertLeft++
	})

	init = function(stru){
		structs = stru
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
		this.title = 0
		this.number = 0
		this.sections = {}
		return this
	}
	Course.prototype.init = function(){
		this.title = arguments[0]
		this.number = parseInt(arguments[1],10)
		this.sections = {}
		return this
	}
	Course.createFromInfo = function(titleString){
		var number = ((t=titleString.match(/[a-z]+\s([0-9]{3,})/i)) && t.length===2) ? t[1] : '0'
		return (new Course()).init(titleString.split(' - ')[0],number)
	}
	Course.prototype.addSectionFromInfo = function(title, details, credits){
		var section = Section.createFromInfo(title, details, credits)
		this.sections[section.number] = section
		return section
	}
	Course.prototype.toString = function(){
		return ''+this.number
	}


	Section = function(){
		this.number = 0
		this.sectionId = 0
		this.credits = 0
		this.timeslots = []
		this.name = ""
		this.instructor = ""
		return this
	}
	Section.prototype.init = function(){
		this.number = arguments[0]
		this.sectionId = arguments[1]
		this.credits = arguments[2]
		return this
	}
	Section.createFromInfo = function(title, details, credits){
		var pieces, number, sectionId, row, result
		pieces = title.split(' - ').reverse()
		number = title.match(/\s([0-9]{5,})\s/)[1]
		sectionId = pieces[0]
		row=details.splice(0,7)
		result = (new Section()).init(number, sectionId, credits)
		while (row.length>1) {
			result.timeslots.push(Timeslot.createFromInfo(row))
			row=details.splice(0,7)
		}
		return result
	}


	Timeslot = function(){
		this.days = []
		this.startTime = ''
		this.endTime = ''
		this.type = ''
		this.location = ''
		this.instructor = ''
		this.endDate = ''
		return this
	}
	Timeslot.prototype.init = function(){
		this.days = arguments[0]
		this.startTime = arguments[1]
		this.endTime = arguments[2]
		this.type = arguments[3]
		this.location = arguments[4]
		this.instructor = arguments[5]
		this.endDate = arguments[6]
		return this
	}
	Timeslot.createFromInfo = function(details){
		timesString = details[1]
		dayString = details[2]
		locationString = details[3]
		datesString = details[4]
		typeString = details[5]
		instructorString = details[6]

		// Split out days and convery to full name
		dayMap = {'M':'monday', 'T':'tuesday','W':'wednesday','R':'thursday','F':'friday','S':'saturday','U':'sunday','O':'online'}
		dayNumbers = ['U','M','T','W','R','F','S']
		days = dayString.split('').map(function(d){return dayMap[d]})


		// Get the start datetime & end datetime
		dateParts = datesString.split(' - ')
		startDate = new Date(dateParts[0])
		if ( days.length > 1 ){
			// Adjust date to actual start day
			while (days[0]!='online' && dayMap[dayNumbers[startDate.getDay()]] != days[0]){
				startDate.setDate(startDate.getDate()+1)
			}
		}
		endDate = new Date(dateParts[1])

		// Function to get am/pm to 0-23 hour format
		function toHour(time){
			var pieces = time.match(/([0-9]+):([0-9]+)\s?([a-z]+)/i)
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
			startTime = new Date(startDate)
			startTime.setHours(toHour(timeParts[0]))
			startTime.setMinutes(parseInt(startParts[1].replace(/[a-z]+/gi, ''), 10))

			endParts = timeParts[1].split(/\s|:/)
			endTime = new Date(startDate)
			endTime.setHours(toHour(timeParts[1]))
			endTime.setMinutes(parseInt(endParts[1], 10))
		}

		// Type string
		type = typeString.replace(/\*/g, '')

		// Instructor String
		instructor = instructorString.replace(/\s*\([pP]\)/, '')

		return (new Timeslot()).init(days,startTime,endTime,type,locationString,instructor,endDate)
	}





































	function storeSchool(passedSchool, next){
		var search = {
							name: passedSchool.name
						,	abbr: passedSchool.abbr
						,	state: passedSchool.state
						,	city: passedSchool.city
						, zip: passedSchool.zip}
			,	school = new structs.School(search);
		// Convert the Model instance to a simple object using Model's 'toObject' function
		// to prevent weirdness like infinite looping...
		var upsertData = school.toObject();
		// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
		delete upsertData._id;
		// Do the upsert, which works like this: If no Contact document exists with
		// _id = contact.id, then create a new doc using upsertData.
		// Otherwise, update the existing doc with upsertData
		structs.School.update(search, upsertData, {upsert: true}, function(err, numAffected){
			// Find the school we just saved for future reference
			structs.School.findOne(search, function(err, dbSchool){ storeTerms(passedSchool, dbSchool); })
		}); // end update
		
		emitter.on('decreaseCount', function(){
			if ( --insertLeft === 0 ){
				next()
			}
		})
	}

	function storeTerms(objSchool, dbSchool){
		objTerm = objSchool.terms[0]
		var search = {
				name: objTerm.season + ' ' +objTerm.year
			,	season: objTerm.season
			,	year: objTerm.year
			,	number: objTerm.number
			, school: dbSchool['_id']
		}
		,	term = new structs.Term(search)
		,	upsertData = term.toObject();
		
		delete(upsertData._id)

		structs.Term.update(search, upsertData, {upsert: true}, function(err, numAffected){
			structs.Term.findOne(search, function(err, dbTerm){
				dbSchool.addTerm(dbTerm)
				storeDepartments(objSchool, dbSchool, dbTerm);
			})
		})
	}

	function storeDepartments(objSchool, dbSchool, dbTerm){
		//console.log('Inserting Departments')
		//console.log('Incresgin from department')
		emitter.emit('increaseCount')
		var depEmitter = new EventEmitter()
			,	depCount = 0
		for ( var d in objSchool.departments ){
			depCount++
			if ( !objSchool.departments.hasOwnProperty(d) ){
				continue
			}
			objDep = objSchool.departments[d]
			//console.log('   inserting department', objDep.abbr)
			var search = {
					name: objDep.text
				,	abbr: objDep.abbr
				, school: dbSchool['_id']
			}
			, department = new structs.Department(search)
			,	upsertData = department.toObject();
			delete(upsertData._id)
			structs.Department.update(search, upsertData, {upsert: true}, (function(dbSchool, dbTerm, objDep, search){
				return function(err, numAffected){
					structs.Department.findOne(search, function(err, dbDep){
						storeCourses(dbSchool, dbTerm, objDep, dbDep);
						depEmitter.emit('decreaseCount')
					})
				}})(dbSchool, dbTerm, objDep, search)
			)
		}
		depEmitter.on('decreaseCount', function(){
			if ( --depCount === 0 ){
				//console.log('Decreasing from department')
				emitter.emit('decreaseCount')
			}
		})
	}


	function storeCourses(dbSchool, dbTerm, objDep, dbDep){
		//console.log('Increase for department')
		emitter.emit('increaseCount')
		var courseCount = 0
			,	courseEmitter = new EventEmitter()
		for ( var c in objDep.courses ){
			if ( !objDep.courses.hasOwnProperty(c) ){
				continue;
			}
			courseCount++
			objCourse = objDep.courses[c]
			//console.log('   inserting course', ''+objCourse)
			var search = {
					name: objCourse.title
				,	department: dbDep['_id']
				,	number: objCourse.number
			}
			, course = new structs.Course(search)
			,	upsertData = course.toObject();
			delete(upsertData._id);
			delete(upsertData.terms);
			structs.Course.update(search, {$set:upsertData,$addToSet:{terms:dbTerm._id}}, {upsert: true}, (function(dbTerm, objCourse, search){
				return function(err, numAffected){
					if ( err ){ throw err }
					structs.Course.findOne(search, function(err, dbCourse){
						if ( err ){ throw err }
						storeSections(dbTerm, objCourse, dbCourse, dbDep);
						courseEmitter.emit('decreaseCount'); })
				}})(dbTerm, objCourse, search)
			)
		}
		if ( courseCount === 0 ){
				emitter.emit('decreaseCount')
		}
		courseEmitter.on('decreaseCount', function(){
			if ( --courseCount === 0 ){
				emitter.emit('decreaseCount')
			}
		})
	}


	function storeSections(dbTerm, objCourse, dbCourse, dbDep){
		//console.log('Inserting Sections for Course', ''+objCourse)
		emitter.emit('increaseCount')
		var secCount = 0
			,	secEmitter = new EventEmitter()
		for ( var s in objCourse.sections ){
			if ( !objCourse.sections.hasOwnProperty(s) ){
				continue
			}
			secCount++
			objSection = objCourse.sections[s]
			var search = {
					number: objSection.number
				,	info: objSection.sectionId
				, course: dbCourse['_id']
				,	department: dbCourse['department']
				, term: dbTerm._id
				, credits: objSection.credits
			}

			, section = new structs.Section(search)
			,	upsertData = section.toObject();
			
			delete(upsertData._id);
			delete(search.credits);
			delete(search.name);

			upsertData.name = dbDep.abbr + ' ' + dbCourse.number + ' #' + upsertData.number
			upsertData.instructor = objSection['instructor']
			if ( objSection['seatsTotal'] !== undefined ){
				upsertData.seatsTotal=objSection['seatsTotal']
			}
			if ( objSection['seatsAvailable'] !== undefined ){
				upsertData.seatsAvailable = objSection['seatsAvailable']
			}
			

			structs.Section.update(search, upsertData, {upsert: true}, (function(dbTerm, objSection, search){
				return function(err, numAffected){
					if ( err ){
						console.log("-- Error --",err,objSection,search);
						return;
					}
					structs.Section.findOne(search, function(err, dbSection){
						if ( err || !dbSection ){
							console.log(err, objSection, search, dbSection);
						}
						dbCourse.addSection(dbSection)
						storeTimeslots(dbTerm, objSection, dbSection)
						secEmitter.emit('decreaseCount')
					});
				}})(dbTerm, objSection, search)
			)
		}
		secEmitter.on('decreaseCount', function(){
			if ( --secCount === 0 ){
				emitter.emit('decreaseCount')
			}
		})
	}


	function storeTimeslots(dbTerm, objSection, dbSection){
		emitter.emit('increaseCount')
		dbSection.timeslots = []
		dbSection.save(function(err){
			for ( var i=0, len=objSection.timeslots.length; i<len; i++ ){
				ts = objSection.timeslots[i]
				timeslot = new structs.Section(ts)
				dbSection.timeslots.push(timeslot)
			}
			dbSection.save(function(err){
				emitter.emit('decreaseCount')
			})
		})
	}

	ex.init = init
	ex.Term = Term
	ex.Department = Department
	ex.Course = Course
	ex.Section = Section
	ex.Timeslot = Timeslot

	ex.storeSchool = storeSchool
})(exports);