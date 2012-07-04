var everySchool = require('./everyschool')

var unm = module.exports = everySchool.submodule('unm')
	.fullName('University of New Mexico')
	.location('Albuquerque NM 87131')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('www8.unm.edu')
	.pagePaths({
				termList: "/pls/banp/bwckschd.p_disp_dyn_sched"
			, term: "/pls/banp/bwckgens.p_proc_term_date"
			, listing: "/pls/banp/bwckschd.p_get_crse_unsec"
			, details: "/pls/banp/bwckschd.p_disp_detail_sched"
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
	

	.howto('save')
		.step('storeResults')
		.step('closeDB')

	.configurable('saveSelf')
	.saveSelf(function(){
		var fs = require('fs')
		cacheJSON = {terms: this.terms, departments: this.departments}
		fs.writeFileSync(__dirname + '/../gatech.cache', JSON.stringify(cacheJSON))
		next()
	})

	.configurable('loadSelf')
	.loadSelf(function(){
		var fs = require('fs')
		cacheJSON = JSON.parse(fs.readFileSync(__dirname + '/../gatech.cache').toString())
		this.terms = cacheJSON.terms
		this.departments = cacheJSON.departments
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
			,	data = {p_calling_proc: "bwckschd.p_disp_dyn_sched", p_term: termUpdating}
			,	options = {
						host: self.url
					, path: self.paths.term
					, method: 'POST'
					, data: data
					, referer: 'https://www8.unm.edu/pls/banp/bwckschd.p_disp_dyn_sched'
				}
		this.dl.download(options, function(window, html){
			var $ = window.$
			$('SELECT[name="sel_subj"] OPTION').each(function(){
				$this = $(this)
				abbr = $this.val()
				text = $this.text().replace(/\n.*/g, '')
				self.addDepartment(abbr, text)
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
		self.loadDepartmentSectionsCount++
		downloadLoop = function(d,deps){
			if ( d >= deps.length ){
				self.loadDepartmentSectionsCount--
				emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
				return
			}
			dep = deps[d]
			self.loadDepartmentSections(termUpdating, dep, emitter)
			setTimeout( function(){ downloadLoop(d+1, deps) }, 1000)
		}
		downloadLoop(0, this.departments)

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
	.configurable('loadDepartmentSections')
	.loadDepartmentSections(function(termUpdating, department, emitter){
		var self = this
			,	data = {
						term_in: termUpdating
					,	sel_subj: ["dummy", department.abbr]
					,	sel_day: "dummy"
					,	sel_schd: ["dummy", "%"]
					,	sel_insm: ["dummy", "%"]
					,	sel_camp: ["dummy", "%"]
					,	sel_levl: ["dummy", "%"]
					,	sel_sess: "dummy"
					,	sel_instr: ["dummy", "%"]
					,	sel_ptrm: ["dummy", "%"]
					,	sel_attr: ["dummy", "%"]

					, sel_crse: ""
					, sel_title: ""

					, sel_from_cred: ""
					, sel_to_cred: ""

					, sel_dunt_unit: ""
					, sel_dunt_code: "DAY"

					,	begin_hh: "0"
					,	begin_mi: "0"
					,	begin_ap: "a"

					,	end_hh: "0"
					,	end_mi: "0"
					,	end_ap: "a"
				}
			,	options = {host: self.url, path: self.paths.listing, method: 'POST', data: data, referer: 'https://www8.unm.edu/pls/banp/bwckgens.p_proc_term_date'}
		self.loadDepartmentSectionsCount++
		self.dl.download(options, function(window, html){
			var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList
			if ( self.debug ){
				console.log("Recieved "+department.abbr+" listing")
			}
			$table = $('table.datadisplaytable[summary="This layout table is used to present the sections found"]')
			$sections = $table.find('.ddtitle')
			if ( $sections.length ){
				$sections.each(function(){
					$sectionHead = $(this)
					$sectionDetailsContainer = $sectionHead.parent().next()
					$sectionDetails = $sectionDetailsContainer.find('table.datadisplaytable')
					$sectionDetailsList = $sectionDetails.find('.dddefault')

					title = $sectionHead.children('a').text()
					details = []; $sectionDetailsList.each(function(i,o){details.push($(o).text())})
					credits = $sectionDetailsContainer.html().match(/([\.\d]+)\s(?:TO\s+([\.\d]+)\s+)?Credits/i)
					if ( credits ){
						if ( credits[2] !== undefined ){
							credits = ''+parseInt(credits[1],10)+'-'+parseInt(credits[2],10)
						}else{
							credits = ''+parseInt(credits[1],10)
						}
					}else{
						console.log($sectionDetailsContainer.text(), credits);
						credits = 3
					}
					c = department.findOrAddCourseBySectionTitle(title)
					section = c.addSectionFromInfo(title, details, credits)
					section.instructor = section.timeslots[0]?section.timeslots[0].instructor:''
				})
			}else{
				console.log('Error getting table', $table.text())
			}
			window.close()
			self.loadDepartmentSectionsCount--
			emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
		})
	})


	.configurable('safeUpdateSection')
	.configurable('updateSection')
	.updateSection(function(section, callback){
		var self = this

		Term.findOne(section.term).exec(function(err, term){
			downloadHelper(section, term, callback);
		})

		downloadHelper = function(section, term, callback){
			var data = {
							term_in: ''+term.number
						,	crn_in: ''+section.number
					}
				,	options = {host: self.url, path: self.paths.details, method: 'GET', data: data, referer: 'https://www8.unm.edu/pls/banp/bwckschd.p_get_crse_unsec'}
			self.dl.download(options, function(window, html){

				var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList
				console.log(html);
				$numbers = $('.dddefault').filter(function(){return (/^[0-9\-]+$/).test($(this).text())})
				section.seatsTotal = parseInt($numbers.eq(0).text(), 10)
				avail = $numbers.eq(1).text()
				section.seatsAvailable = remain = parseInt($numbers.eq(2).text(),10)
				if ( $numbers.length === 6 ){
					section.waitSeatsTotal = parseInt($numbers.eq(3).text(), 10)
					waitAvail = $numbers.eq(4).text()
					section.waitSeatsAvailable = waitRemain = parseInt($numbers.eq(5).text(),10)
				}
				section.updated = new Date()
				section.save(function(err){
					callback(err, section)
				})
			})
		}
	})

	.safeUpdateSection(function(section, expires, callback){
		updated = new Date(section.updated).getTime()
		now = (new Date()).getTime()
		if ( updated + expires < now || !section.seatsAvailable ){
			this.updateSection(section, callback)
		}else{
			callback(undefined, section)
		}
	})






