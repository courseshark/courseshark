var everySchool = require('./everyschool')

var gatech = module.exports = everySchool.submodule('gatech')

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
	
	.howto('updateSection')
		.step('sectionDetails')
			.accepts('term section')


	.loadTerms(function(termUpdating){
		var self = this
		options = {host: self.url, path: self.paths.termList}
		self.download(options, function($, html){
			$('SELECT OPTION').each(function() {
				$this = $(this)
				if ( $this.val() ){
					termNames = $this.text().replace(/\s*\([^\)]+\)/, '').split(/\n/g)
					termName = termNames[0]
					termNumber = parseInt($this.val(), 10)
					if ( termNumber == termUpdating ){
						self.addTerm(termNumber, termName)
						console.log(self.terms)
					}
				}
			})
			next(termUpdating)
		})
	})
	.loadDepartments(function(termUpdating){
		var self = this
		data = {
				p_calling_proc: "bwckschd.p_disp_dyn_sched"
			,	p_term: String(termUpdating)
		}
		options = {host: self.url, path: self.paths.term, method: 'POST', data: data}
		self.download(options, function($, html){
			$('SELECT[name="sel_subj"] OPTION').each(function(){
				$this = $(this)
				abbr = $this.val()
				text = $this.text().replace(/\n.*/g, '')
				self.addDepartment(abbr, text)
			})
			next(termUpdating)
		})
	})
	.listSections(function(termUpdating){
		var self = this
		for ( var dep in this.departments ){
			//self.loadDepartment(termUpdating, dep)
		}
		next(termUpdating)
	})

	.configurable('loadDepartment')
	.loadDepartment(function(termUpdating, department){
		var self = this
		data = {
				term_in: termUpdating
			,	sel_subj: ["", department.abbr]
			,	sel_day: ""
			,	sel_schd: ""
			,	sel_insm: ""
			,	sel_camp: ["", "%"]
			,	sel_levl: ""
			,	sel_sess: ""
			,	sel_instr: ["", "%"]
			,	sel_ptrm: ""
			,	sel_attr: ["", "%"]

			,	sel_crse: ""
			,	sel_title: ""

			,	sel_from_cred: ""
			,	sel_to_cred: ""

			,	begin_hh: "0"
			,	begin_mi: "0"
			,	begin_ap: "a"

			,	end_hh: "0"
			,	end_mi: "0"
			,	end_ap: "a"
		}
		options = {host: self.url, path: self.paths.listing, method: 'POST', data: data}
		self.download(options, function($, html){
			$table = $('table.datadisplaytable[summary="This layout table is used to present the sections found"]')
			$table.find('.ddtitle').each(function(){
				$sectionHead = $(this)
				$sectionDetailsContainer = $sectionHead.parent().next()
				$sectionDetails = $sectionDetailsContainer.find('table.datadisplaytable')
				$sectionDetailsList = $sectionDetails.find('.dddefault')

				title = $sectionHead.children('a').text()
				details = []; $sectionDetailsList.each(function(i,o){details.push($(o).text())})

				c = department.findOrAddCourseBySectionTitle(title)
				section = c.addSectionFromInfo(title, details)
				console.log(section);
			})
			//console.log(department)
		})
	})
