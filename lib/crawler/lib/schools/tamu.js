var banner = require('./banner')

var tamu = module.exports = banner.submodule('tamu')
	.fullName('Texas A&M ')
	.location('College Station TX 77843')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('compass-ssb.tamu.edu')
	.pagePaths({
				termList: "/pls/PROD/bwckschd.p_disp_dyn_sched"
			, term: "/pls/PROD/bwckgens.p_proc_term_date"
			, listing: "/pls/PROD/bwckschd.p_get_crse_unsec"
			, details: "/pls/PROD/bwckschd.p_disp_detail_sched"
	})
	.debug(true);


