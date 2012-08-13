var Browser = require("zombie")
  , should = require("should");
browser = new Browser()

describe('Schedule controller', function(){

  describe('Share with recruiters', function(){

    it("should require you to select school if not logged in", function(done) {
      browser.visit("http://courseshark.dev/schedule", function(){
        browser.success.should.be.ok;
        browser.location.pathname.should.equal('/choose-school');
        browser.html("h1").should.include('Before we continue, we need to know what school you go to');
        done();
      });
    });

  });

});