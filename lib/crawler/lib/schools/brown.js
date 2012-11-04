var banner = require('./banner')

var brown = module.exports = banner.submodule('brown')
  .fullName('Brown University')
  .location('Providence, RI 02912')
  .timezone('America/New_York')
  .uses('banner')
    .configure({})
  .rootUrl('selfservice.brown.edu')
  .pagePaths({
        termList: "/ss/bwckschd.p_disp_dyn_sched"
      , term: "/ss/bwckgens.p_proc_term_date"
      , listing: "/ss/bwckschd.p_get_crse_unsec"
      , details: "/ss/bwckschd.p_disp_detail_sched"
  })
  .debug(true)

