var everySchool = require('./everyschool')

var gatech = module.exports = everySchool.submodule('gatech')
	.fullName('Georgia Institute of Technology')
	.location('Atlanta GA 30332')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('oscar.gatech.edu')
	.pagePaths({
				termList: "/pls/bprod/bwckschd.p_disp_dyn_sched"
			, term: "/pls/bprod/bwckgens.p_proc_term_date"
			, listing: "/pls/bprod/bwckschd.p_get_crse_unsec"
			, details: "/pls/bprod/bwckschd.p_disp_detail_sched"
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
		.step('closeDB')
	

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
		this.dl.downloadDepartments(termUpdating, function(window, html){
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
	.closeDB(function(){
		this.mongoose.disconnect()
		next()
	})

	.configurable('loadDepartmentSectionsCount')
	.loadDepartmentSectionsCount(0)
	.configurable('loadDepartmentSections')
	.loadDepartmentSections(function(termUpdating, department, emitter){
		var self = this
		self.loadDepartmentSectionsCount++
		self.dl.downloadSections(termUpdating, department.abbr, function(window, html){
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
				})
			}else{
				console.log($table.text())
			}
			window.close()
			self.loadDepartmentSectionsCount--
			emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
		})
	})


	.configurable('updateSection')
	.updateSection(function(section, term, callback){
		var self = this
		self.dl.downloadSectionDetails(section, term, function(window, html){
			var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList
			$numbers = $('.dddefault').filter(function(){return (/^[0-9\-]+$/).test($(this).text())})
			console.log($numbers.length)
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
			});
		})
	})






