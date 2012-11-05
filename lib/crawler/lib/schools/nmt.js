var banner = require('./banner')

var nmt = module.exports = banner.submodule('nmt')
  .fullName('New Mexico Tech')
  .location('Socorro NM 87801')
  .timezone('America/Denver')
  .uses('banner')
    .configure({
        seperateDepartments: true
      , seatsListedWithSections: false
      , sectionDetailsOnCrawl: false
    })
  .rootUrl('banweb7.nmt.edu')
  .pagePaths({
        termList: "/pls/PROD/bwckschd.p_disp_dyn_sched"
      , term: "/pls/PROD/bwckgens.p_proc_term_date"
      , listing: "/pls/PROD/bwckschd.p_get_crse_unsec"
      , details: "/pls/PROD/bwckschd.p_disp_detail_sched"
  })
  .debug(true)







