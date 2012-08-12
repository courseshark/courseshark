var Browser = require("zombie")
  , should = require("should");
browser = new Browser()

describe('Sites controller', function(){

  describe('Nonexistant sites', function(){
    it("should respond with a 404", function(done){
      browser.visit('http://courseshark.dev/greg_is_the_best', function(){
        browser.statusCode.should.equal(404)
        //Todo: test rendered page
        done();
      });
    });
  });

  describe('About page', function(){
    it("should respond with the about page", function(done){
      browser.visit('http://courseshark.dev/about', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('About');
        done();
      });
    });
  });

  describe('Terms page', function(){
    it("should respond with the terms page", function(done){
      browser.visit('http://courseshark.dev/about/terms', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('Terms and Conditions of Use');
        done();
      });
    });
  });

  describe('Privacy page', function(){
    it("should respond with the privacy page", function(done){
      browser.visit('http://courseshark.dev/about/privacy', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('Privacy Policy');
        done();
      });
    });
  });

  describe('Feedback page', function(){
    it("should respond with the feedback page", function(done){
      browser.visit('http://courseshark.dev/about/feedback', function(){
        browser.success.should.be.ok;
        browser.text("body").should.include('Feedback');
        done();
      });
    });
  });

});