var Browser = require("zombie")
  , should = require("should");
browser = new Browser();

describe('Recruiter controller', function(){

  describe('Share with recruiters', function(){
    it("should respond with the share with recruiters page", function(done){
      browser.visit('http://courseshark.dev/share-with-recruiters', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('Share your Schedule?');
        done();
      });
    });

    //Todo: test modal render
    //Todo: share-with-recruiters PUT test

  });

  describe('Recruiter share invite', function(){
    it('should respond with the recruiter share invite page', function(done){
      browser.visit('http://courseshark.dev/recruiter-share-invite', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('Sign In and share your schedule with recruiters looking for your skills');
        done();
      });
    });
  });

});