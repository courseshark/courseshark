var banner = require('./banner')

var uah = module.exports = banner.submodule('uah')
	.fullName('University of Alabama Huntsville')
	.location('Huntsville AL 35805')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
			, dummy: true
		})
	.rootUrl('sierra.uah.edu')
	.pagePaths({
				termList: "/PROD/bwckschd.p_disp_dyn_sched"
			, term: "/PROD/bwckgens.p_proc_term_date"
			, listing: "/PROD/bwckschd.p_get_crse_unsec"
			, details: "/PROD/bwckschd.p_disp_detail_sched"
	})
	.debug(true)