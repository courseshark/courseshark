var everySchool = require('./everyschool')


function contains(a, obj) {
	for (var i=0,l=a.length;i<l;i++) {
		if (a[i]===obj){return true}
	}
	return false
}

var spsu = module.exports = everySchool.submodule('spsu')
	.fullName('Southern Polytechnic State University')
	.location('Marietta GA 30060')
	.uses('banner')
		.configure({
				seperateDepartments: false
			,	seatsListedWithSections: true
			,	sectionDetailsOnCrawl: false
			, ignoreDepartments: ['ALL']
		})
	.rootUrl('banweb.spsu.edu')
	.pagePaths({
				termList: "/pls/PROD/schedule.main"
			, term: "/pls/PROD/schedule.disp_subj_by_term"
			, listing: "/pls/PROD/schedule.disp_crse_by_subj"
	})
	.debug(true)
	.howto('crawl')
		.returns('departments')
		.step('loadTerms')
			.accepts('term')
		.step('loadDepartments')
			.accepts('terms')
		.step('listSections')
			.accepts('term')
		.step('storeResults')


	.configurable('termDates')
	.termDates({
			201208: '8/15/2012 - 12/3/2012'
		,	201205: '5/21/2012 - 7/26/2012'
	})

	.loadTerms(function(termUpdating){
		var self = this
		options = {host: self.url, path: self.paths.termList}
		self.download(options, function(window, html){
			var $ = window.$
			$('SELECT OPTION').each(function() {
				$this = $(this)
				if ( $this.val() ){
					termNames = $this.text().replace(/\s*\([^\)]+\)/, '').split(/\n/g)
					termName = termNames[0]
					termNumber = parseInt($this.val(), 10)
					if ( termNumber == termUpdating ){
						self.addTerm(termNumber, termName)
					}
				}
			})
			window.close()
			next(termUpdating)
		})
	})
	.loadDepartments(function(termUpdating){
		var self = this
		data = {
			cterm_in: termUpdating
		}
		options = {host: self.url, path: self.paths.term, method: 'POST', data: data}

		this.dl.download(options, function(window, html){
			var $ = window.$
			$('SELECT[name="csubj_in"] OPTION').each(function(){
				$this = $(this)
				abbr = $this.val()
				text = $this.text().replace(/\n.*/g, '')
				if ( !contains(self.config['ignoreDepartments'], abbr) ){
					self.addDepartment(abbr, text)
				}
			})
			window.close()
			next(termUpdating)
		})
	})
	.listSections(function(termUpdating){
		var self = this
			, EventEmitter = require("events").EventEmitter
			,	emitter = new EventEmitter()
			function sleep(milliSeconds) {
				var startTime = new Date().getTime();
				while (new Date().getTime() < startTime + milliSeconds);
			}
		self.loadAllSections(termUpdating, emitter)
		
		emitter.on('doneLoadingDept', function(numLeft){
			if (numLeft === 0){
				next(termUpdating);
			}
		})
	})
	.storeResults(function(termUpdating){
		this.structures.storeSchool(this, next)
	})
	.configurable('closeDB')
	.closeDB(function(){
		this.mongoose.disconnect()
		next()
	})

	.configurable('loadDepartmentSectionsCount')
	.loadDepartmentSectionsCount(0)

	.configurable('loadAllSections')
	.loadAllSections(function(termUpdating, emitter){
		var self = this
			,	data = {
						cterm_in: termUpdating
					, csubj_in: 'ALL'
				}
		options = {host: self.url, path: self.paths.listing, method: 'GET', data: data}
		self.dl.download(options, function(window, html){
			var $ = window.$, recentSection
			if ( self.debug ){console.log("Recieved ALL listing")}
			$('tr:not(tr:first)').each(function(t, e){
				var data=[]
					,	$row = $(e)
					, classInfo
					,	crn
					, depAbbr
					,	courseNumber
					, sectionNumber
					, creditHours
					, days
					, sectionWeeks
					, sectionTimes
					, sectionInstructor
					, sectionLocation
					, sectionSeats
					,	seatsTotal
					, seatsAvailable
					, dateRange
				$row.children('td').map(function(i,el){data[i]=$(el).text().trim()})
				classInfo = data[1].split(/[\/\s]/).filter(function(i){return i!==""})
				crn = data[0]
				days = data[4].replace(/online/gi, 'O').replace(/tba|\s/gi, '')
				sectionWeeks = data[5]
				sectionTimes = data[6]
				sectionInstructor = data[7]
				sectionLocation = data[8]
				dateRange = self.termDates[termUpdating]
				if ( crn ){
					depAbbr = classInfo[0]
					courseNumber = classInfo[1]
					sectionNumber = classInfo[2]
					courseName = data[2].split(/\s{2,}/)[0]
					creditHours = data[3]
					sectionSeats = data[9].match(/([0-9\-]+)\/([0-9\-]+)\/([0-9\-]+)/)
					seatsTotal = parseInt(sectionSeats[3],10)
					seatsAvailable = seatsTotal - parseInt(sectionSeats[2],10)
					for(var i in self.departments){
						if ( !self.departments.hasOwnProperty(i) || self.departments[i].abbr!=depAbbr){continue;}
						dep = self.departments[i]
						course = false
						for( var j in dep.courses ){
							if ( !dep.courses.hasOwnProperty(j) || dep.courses[j].number!=courseNumber){continue;}
							course = dep.courses[j]
						}
						if ( !course ){
							course = (new self.structures.Course()).init(courseName, courseNumber)
							dep.courses[''+course] = course
						}
						section = (new self.structures.Section()).init(crn,sectionNumber,creditHours)
						section.seatsAvailable = seatsAvailable
						section.seatsTotal = seatsTotal
						section.instructor = sectionInstructor
						timeslot = self.structures.Timeslot.createFromInfo([null,sectionTimes, days, sectionLocation, dateRange, '', sectionInstructor])
						section.timeslots.push(timeslot)
						course.sections[section.number] = section
						recentSection = section
					}
				}else{
					timeslot = self.structures.Timeslot.createFromInfo([null,sectionTimes, days, sectionLocation, dateRange, '', sectionInstructor])
					recentSection.timeslots.push(timeslot)
				}
			})
			emitter.emit('doneLoadingDept', 0)
		})
	})

	.configurable('updateLock')
	.configurable('updateSection')
	.updateSection(function(section, callback){
		var self = this
		Section.findById(section._id).populate('term').populate('department').exec(function(err, section){
				var	data = {
							cterm_in: section.term.number.toString()
						, csubj_in: section.department.abbr
					}
			options = {host: self.url, path: self.paths.listing, method: 'GET', data: data, referer: self.url+self.paths.term}
			self.dl.download(options, function(window, html){
				var $ = window.$
					,	rows = $('tr:not(tr:first)')
				rows.each(function(i, e){
					var data=[]
						,	$row = $(e)
						, classInfo
						,	crn
						, sectionNumber
						, sectionSeats
						,	seatsTotal
						, seatsAvailable
					$row.children('td').map(function(i,el){data[i]=$(el).text().trim()})
					classInfo = data[1].split(/[\/\s]/).filter(function(i){return i!==""})
					crn = parseInt(data[0], 10)
					if ( crn && !isNaN(crn) ){
						sectionNumber = classInfo[2]
						sectionSeats = data[9].match(/([0-9\-]+)\/([0-9\-]+)\/([0-9\-]+)/)
						seatsTotal = parseInt(sectionSeats[3],10)
						seatsAvailable = seatsTotal - parseInt(sectionSeats[2],10)
						Section.findOne({term:section.term._id, number: crn, department: section.department._id}, function(err, sec){
							if ( err ){ console.log('spsu-updater-err',err);}
							if ( !sec ){ console.log('no section found', {term:section.term._id, number: crn, department: section.department._id}); return; }
							sec.seatsAvailable = seatsAvailable
							sec.seatsTotal = seatsTotal
							sec.updated = new Date()
							sec.save(function(){
								callback(err, sec)
							})
						})
					}
					// Unlock on the last element
					if ( i === rows.length-1 ){
						self.updateLock[section.department] = undefined
					}
				}) // end foreach row
			}) // end download
		}) // end section
	}) // end update sections

	.configurable('safeUpdateSection')
	.safeUpdateSection(function(section, expires, callback){
		updated = new Date(section.updated).getTime()
		now = (new Date()).getTime()
		if ( updated + expires < now && typeof this.updateLock[section.department] === 'undefined'){
			this.updateLock[section.department] = true
			this.updateSection(section, callback)
		}else{
			callback(undefined, section)
		}
	})




