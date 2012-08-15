var Browser = require("zombie")
  , should = require("should");
browser = new Browser();

describe('Schedule controller', function(){

  describe('Schedule page', function(){

    before(function(done) {
      this.browser = new Browser();
      this.browser
        .visit("http://localhost:8080/schedule", { debug: true })
        .then(function(){
          console.log("The page:", browser.html());
          done()
        })
        .fail(function(error) {
          console.log("Not good:", error)
        });
    });

    it("should require you to select school if not logged in", function(done) {
      console.log(this.browser.html());
      done();
    });

  });

});