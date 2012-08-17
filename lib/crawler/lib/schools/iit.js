var everySchool = require('./everyschool')

var iit = module.exports = everySchool.submodule('iit')
	.fullName('Illinois Institute of Technology')
	.location('Chicago IL 60647')
	.timezone('America/New_York')
	.uses('banner')
		.configure({
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
		})
	.rootUrl('my102.iit.edu')
	.pagePaths({
				termList: "/banr/bwckschd.p_disp_dyn_sched"
			, term: "/banr/bwckgens.p_proc_term_date"
			, listing: "/banr/bwckschd.p_get_crse_unsec"
			, details: "/banr/bwckschd.p_disp_detail_sched"
	})
	.debug(true)





