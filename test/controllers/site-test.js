var should = require('should')
  , request = require('request');

describe('Sites controller', function(){

  describe('Nonexistant sites', function(){
    it("should respond with a 404", function(done){
      request('http://courseshark.dev/greg_is_the_best', function(err,resp,body){
        should.not.exist(err);
        resp.should.have.status(404);
        resp.body.should.include('404');
        done();
      });
    });
  });

  describe('About page', function(){
    it("should respond with the about page", function(done){
      request('http://courseshark.dev/about', function(err,resp,body){
        should.not.exist(err);
        resp.should.have.status(200);
        resp.body.should.include('About');
        done();
      });
    });
  });
});