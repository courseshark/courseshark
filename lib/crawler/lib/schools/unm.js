var banner = require('./banner')

var unm = module.exports = banner.submodule('unm')
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