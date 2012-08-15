var soda_sync = require('soda-sync')
  , soda = soda_sync.soda
  , SodaCan = soda_sync.SodaCan
  , should = require('should');

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
browser.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
});


describe('User controller', function(){

  describe("creating account", function(){
    var t;
    var unique_name = String(Date.now());

    it("it lets you create an account", SodaCan(function(){
      t = this;
      t.session();
      t.open('/');
      t.waitForTextPresent('Scheduling made simple');
      t.click('signInButton');
      t.waitForTextPresent('Login');
      t.click('signup');
      t.waitForTextPresent('Register');
      t.type('signup_email',unique_name + "@domain.com");
      t.type('signup_password',unique_name);
      t.type('c_password',unique_name);
      t.select('school_id','Georgia Tech');
      t.click('registerButton');
      t.waitForElementPresent('accountDropdown');
      t.testComplete();
    }));

    it("doesn't let you create an existing account", SodaCan(function(){
      t.session();
      t.open('/');
      t.waitForTextPresent('Scheduling made simple');
      t.click('signInButton');
      t.waitForTextPresent('Login');
      t.click('signup');
      t.waitForTextPresent('Register');
      t.type('signup_email',unique_name + "@domain.com");
      t.type('signup_password',unique_name);
      t.type('c_password',unique_name);
      t.select('school_id','Georgia Tech');
      t.click('registerButton');
      t.assertTextPresent('Email already taken');
      t.testComplete();
    }));
  })

  describe("logging in/out", function(){
    var t;

    it("should let you log in", SodaCan(function(){
      t = this;
      t.session();
      t.open('/');
      t.waitForTextPresent('Scheduling made simple');
      t.click('signInButton');
      t.waitForTextPresent('Login');
      t.type('login_email','greg@greg.com');
      t.type('login_password','greg');
      t.click('loginButton');
      t.waitForTextPresent('greg@greg.com');
    }));

    it("should let you log out", SodaCan(function(){
      t.click('accountDropdown');
      t.waitForTextPresent('Log Out');
      t.click('logOut');
      t.waitForTextPresent('Sign In');
      t.testComplete();
    }));

  });


  });


