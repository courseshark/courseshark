var query_filter = require('../../lib/query-filter.js')
  , should = require('should');

describe("Lib: Query Filter", function(){

  describe("objectify", function(){

    var req = {query: {"greg.firstname" : "greg", "greg.awesomeness" : "a lot"}, body: {"james.awesomeness" : "alright"}}
      , res = {}
      , next = function(){};

    before(function(done){
      query_filter(req,res,done);
    });

    it ("objectify objectifies objects", function(){
      should.exist(req.query)
      should.exist(req.query.greg.firstname);
      req.query.greg.firstname.should.equal("greg");
      should.exist(req.query.greg.awesomeness);
      req.query.greg.awesomeness.should.equal("a lot");
      should.exist(req.body)
      should.exist(req.body.james.awesomeness);
      req.body.james.awesomeness.should.equal("alright");
    });

  });

});

