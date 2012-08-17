var banner = require('./banner')

var uncc = module.exports = banner.submodule('uncc')
	.fullName('UNC Charlotte')
	.location('Charlotte NC 28202')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('selfservice.uncc.edu')
	.pagePaths({
				termList: "/pls/BANPROD/bwckschd.p_disp_dyn_sched"
			, term: "/pls/BANPROD/bwckgens.p_proc_term_date"
			, listing: "/pls/BANPROD/bwckschd.p_get_crse_unsec"
			, details: "/pls/BANPROD/bwckschd.p_disp_detail_sched"
	})
	.debug(true)