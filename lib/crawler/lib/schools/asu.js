var blackboardAsu = require('./blackboard-asu')

var asu = module.exports = blackboardAsu.submodule('asu')


  .fullName('Arizona State University')
  .location('Tempe, AZ 85287')
  .timezone('America/Phoenix')
  .rootUrl('webapp4.asu.edu')
  .uses('blackboard-asu')
  .pagePaths({
        termList: "/catalog/TooltipTerms.ext"
      , subjectList: "/catalog/Subjects.html"
      , listing: "/catalog/classlist"
      , details: "/catalog/course"
  })
  .debug(false)
