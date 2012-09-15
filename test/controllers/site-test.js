var soda_sync = require('soda-sync')
  , soda = soda_sync.soda
  , SodaCan = soda_sync.SodaCan;

var browser = null;

SodaCan = SodaCan({
  "with": function() {
    return browser;
  },
  pre: function() {
    return this.timeout(5000);
  }
});
browser = soda.createClient({
  host: "localhost",
  port: 4444,
  url: "http://courseshark.dev",
  browser: "googlechrome",
  mode: 'sync'
});
// browser.on('command', function(cmd, args){
//   console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
// });

describe('Sites controller', function(){

  describe('Nonexistant sites', function(){
    var t;
    it("respond with a 404", SodaCan(function(){
      t = this;
      t.session();
      t.open('/greg_is_the_best');
      t.waitForTextPresent('404');
      t.testComplete();
    }));
  });

  describe('About page', function(){
    var t;
    it("respond with the about page", SodaCan(function(){
      t = this;
      t.session();
      t.open('/about');
      t.waitForTextPresent('About');
      t.testComplete();
    }));
  });

  describe('Terms page', function(){
    var t;
    it("respond with the terms page", SodaCan(function(){
      t = this;
      t.session();
      t.open('/about/terms');
      t.waitForTextPresent('Terms and Conditions of Use');
      t.testComplete();
    }));
  });

  describe('Privacy page', function(){
    var t;
    it("respond with the privacy page", SodaCan(function(){
      t = this;
      t.session();
      t.open('/about/privacy');
      t.waitForTextPresent('Privacy Policy');
      t.testComplete();
    }));
  });

  describe('Feedback page', function(){
    var t;
    it("respond with the feedback page", SodaCan(function(){
      t = this;
      t.session();
      t.open('/about/feedback');
      t.waitForTextPresent('Feedback');
      t.testComplete();
    }));
  });

});