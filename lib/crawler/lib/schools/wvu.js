var banner = require('./banner')

var wvu = module.exports = banner.submodule('wvu')
	.fullName('West Virginia University')
	.location('Morgantown WV 26506')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('star.wvu.edu')
	.pagePaths({
				termList: "/pls/starprod/bwckschd.p_disp_dyn_sched"
			, term: "/pls/starprod/bwckgens.p_proc_term_date"
			, listing: "/pls/starprod/bwckschd.p_get_crse_unsec"
			, details: "/pls/starprod/bwckschd.p_disp_detail_sched"
	})
	.debug(true)