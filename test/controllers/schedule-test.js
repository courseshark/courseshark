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

describe('Schedule controller', function(){

  describe("Schedule page", function(){
    var t;

    it("/schedule requires school selection if not logged in", SodaCan(function(){
      t = this;
      t.session();
      t.open('/schedule');
      t.waitForTextPresent('Before we continue, we need to know what school you go to');
    }));

    it("after school selection take you to the schedule page", SodaCan(function(){
      t.click('schools_gatech');
      t.waitForTextPresent('CRN List');
      t.testComplete();
    }));

    it("/schedule routes to schedule if you are logged in", SodaCan(function(){
      t = this;
      t.session();
      t.open('/schedule');
      t.waitForTextPresent('Before we continue, we need to know what school you go to');
      t.click('signInButton');
      t.waitForTextPresent('Login');
      t.type('login_email','greg@greg.com');
      t.type('login_password','greg');
      t.click('loginButton');
      t.waitForElementPresent('accountDropdown');
      t.open('/schedule');
      t.waitForTextPresent('CRN List');
    }));

    it ("create a new schedule", SodaCan(function(){
      t.click('id=new-button');
      t.waitForElementPresent('id=term-selector');
      t.click('id=new-term-submit');
      t.verifyNotVisible('id=term-selector');
      t.verifyElementNotPresent('xpath=//div[@class="wk-event-listing"]');
    }));

    it ("select a subject and a class", SodaCan(function(){
      t.waitForElementPresent('id=major-id')
      t.select('id=major-id','index=1');
      t.waitForTextPresent('2101');
      t.select('id=course-id','index=1');
      t.verifyElementPresent('id=class-list');
    }));

    it ("add a class to schedule", SodaCan(function(){
      t.waitForElementPresent('xpath=//div[@class="section-option"]');
      t.click('xpath=//div[@class="section-option"]');
      t.verifyElementPresent('xpath=//div[@class="wk-event-listing"]');
    }));

    //Todo: Test mouseover of class list

    it ("display details on demand", SodaCan(function(){
      t.mouseOver('xpath=//div[contains(@class,"wk-event-listing")][1]');
      t.verifyTextPresent('Section Number');
      t.mouseOut('xpath=//div[contains(@class,"wk-event-listing")][1]');
    }));

    it ("save a schedule", SodaCan(function(){
      t.click('id=save-button');
      t.waitForElementPresent('save_name');
      t.click('save_name')
      t.focus('save_name')
      t.type('save_name','awesome')
      t.typeKeys('save_name','awesome');
      t.click('save_save');
      t.verifyNotVisible('id=name-input');
    }));

    it ("load a saved schedule", SodaCan(function(){
      //setup
      t.click('id=new-button');
      t.waitForElementPresent('id=term-selector');
      t.click('id=new-term-submit');
      //foreal
      t.click('id=load-button');
      t.waitForTextPresent('Open a perviously created schedule:');
      t.click('xpath=//a[contains(.,"awesome")]');
      t.verifyElementNotPresent('id=loadList');
      t.verifyElementPresent('xpath=//div[@class="wk-event-listing"]');
    }));

    it ("delete schedule from load menu", SodaCan(function(){
      t.click('id=load-button');
      t.waitForTextPresent('Open a perviously created schedule:');
      t.click('xpath=//div[@class="delete"]');
      t.assertConfirmation('Delete this schedule?');
      t.click("load_close");
      //Todo: make this actually test the deletion?
    }));

    //Todo: test print (non-trivial)

    it ("should let you share your schedule", SodaCan(function(){
      t.click('id=link-button');
      t.verifyTextPresent('http://gatech.courseshark.dev/');
      t.click('share_close');
      t.testComplete();
    }));

  });
});
