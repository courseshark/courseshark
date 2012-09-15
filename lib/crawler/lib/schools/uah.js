var banner = require('./banner')

var iit = module.exports = banner.submodule('iit')
	.fullName('University of Alabama Huntsville')
	.location('Huntsville AL 35805')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('sierra.uah.edu')
	.pagePaths({
				termList: "/PROD/bwckschd.p_disp_dyn_sched"
			, term: "/PROD/bwckgens.p_proc_term_date"
			, listing: "/PROD/bwckschd.p_get_crse_unsec"
			, details: "/PROD/bwckschd.p_disp_detail_sched"
	})
	.debug(true)