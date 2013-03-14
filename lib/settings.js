var express = require('express')
  , mongoStore = require('connect-mongodb')
  , everyauth = require('everyauth')
  , partials = require('express-partials')
  , flash = require('connect-flash')
  , auth = require('./authorization')
  , flipflop = require('./flipflop')
  , fs = require('fs')
  , redisInfo = require('url').parse(process.env.COURSESHARK_REDIS_URI)
  , redis = require('redis')
  , redisConnection = redis.createClient(redisInfo.port, redisInfo.hostname)
  , onlineNow = require('./online-now')


exports.boot = function(app, mongoose){
  bootApplication(app, mongoose)
};

function bootApplication(app, mongoose){
  fileLocation = app.config.COURSESHARK_ACCESS_LOG || "/var/log/courseshark.access.log"
  logFile = fs.createWriteStream(fileLocation, {flags: 'a', encoding: null, mode: 666})


  auth.everyauthBoot(everyauth, app);

  app.configure(function(){
    app.set('views', __dirname + '/../views')
    app.set('view engine', 'ejs')
    app.use(express.logger({stream: logFile}));
    app.use(express.bodyParser())
    app.use(require('./query-filter'))
    app.use(express.methodOverride())
    app.use(function(req,res,next){res.header("X-powered-by", "Sharks");next()})
    app.use(require('connect-less')({ src: __dirname + '/../public/', compress: true, yuicompress: true }));
    app.use(require('./coffee-compile')({
      force: true,
      src: __dirname + '/../public',
      streamOut: true
    }));
    app.use(express.compress())
    app.use(express.static(__dirname + '/../public'))
    app.use(express.cookieParser('detta-är-en-hemlighet'))
    app.use(express.session({
      secret: 'c6b747964854ebfc8f1f8a42c232b6d3',
      store: new mongoStore({
        db: mongoose.connection.db,
        collection : 'sessions'
      }),
      cookie : { domain : '.'+app.config.COURSESHARK_DOMAIN },
      domain : '.'+app.config.COURSESHARK_DOMAIN,
      httpOnly : true,
      maxAge : 1000*60*60*24*5 // 5 days
    }))
    app.use(everyauth.middleware())
    app.use(require('./social-track').middleWare)
    app.use(flipflop.middleware)

    // Helpers
    require('../lib/helpers').boot(app);
    // load the express-partials middleware
    app.use(partials());
    // load flash middleware
    app.use(flash());

    onlineNow(app, redisConnection)


    app.use(express.favicon())
    app.use(require('./subdomains'))
    app.use(app.router)
  });

  app.set('showStackError', false)
  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })
  app.configure('staging', function(){
    app.enable('view cache')
  })
  app.configure('production', function(){
    app.enable('view cache')
  })

  try{
    gitHead = fs.readFileSync(__dirname+'/../.git/refs/remotes/origin/master', 'utf-8').trim();
    app.set('revision', gitHead)
  }catch(e){
    app.set('revision', 'r'+(new Date()).getTime())
  }
}