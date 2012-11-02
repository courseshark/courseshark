var banner = require('./banner')

var gatech = module.exports = banner.submodule('gatech')
  .fullName('Georgia Tech')
  .location('Atlanta GA 30318')
  .timezone('America/New_York')
  .uses('banner')
    .configure({options:'go-here'})
  .rootUrl('oscar.gatech.edu')
  .pagePaths({
        termList: "/pls/bprod/bwckschd.p_disp_dyn_sched"
      , term: "/pls/bprod/bwckgens.p_proc_term_date"
      , listing: "/pls/bprod/bwckschd.p_get_crse_unsec"
      , details: "/pls/bprod/bwckschd.p_disp_detail_sched"
  })
  .debug(true)







