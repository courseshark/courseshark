/** Main application file
 * Kicks off the whole show
 */

var   express = require('express')
    , fs = require('fs')
    , auth = require('./lib/authorization')
    , utils = require('./lib/utils')
    , app = express()
    , port = process.env.PORT || 8080
    , sio = require('socket.io')
    , io
    , mongoose = require('mongoose')
    , mixpanel = new require('mixpanel').init(process.env.COURSESHARK_MIXPANEL_ACCESS_TOKEN)
    , seatwatcher = require('./seat-watcher');


console.log("\n\nStarting in mode:", app.settings.env);

app.config = process.env;
app.mixpanel = mixpanel;
app.mixpanel.set_config({ test: (process.env.COURSESHARK_MIXPANEL_TEST||'').match(/true/i)
                        , debug: (process.env.COURSESHARK_MIXPANEL_DEBUG||'').match(/true/i)});

mongoose.connection.on('open', function(){
  console.log('Database Connected');
  Schema = mongoose.Schema;
  ObjectId = mongoose.Types.ObjectId;
  // Bootsrap models
  model_loc = __dirname + '/models';
  model_files = fs.readdirSync(model_loc);
  model_files.forEach( function (file) {
    require(model_loc + '/' + file).boot(app);
  })
  require('./lib/social-track').boot(app);
  // Configuration
  require('./lib/flipflop').boot(app, mongoose, function(){


    // Configuration
    require('./lib/settings').boot(app, mongoose);


    //Error Handler
    require('./lib/error-handler').boot(app);


    // make a global helper
    requireLogin = auth.requireLogin;
    requireAdmin = auth.requireAdmin;
    requireSchool = utils.requireSchool;
    wantSchool = utils.wantSchool;


    // Start the app by listening on <port>
    var server = app.listen(port);
    // Socket.io
    app.io = io = sio.listen(server);
    app.io.enable('browser client minification');  // send minified client
    app.io.enable('browser client etag');          // apply etag caching logic based on version number
    app.io.enable('browser client gzip');          // gzip the file
    app.io.set('log level', 1);                    // reduce logging
    app.io.set('transports',['websocket']);        // enable all transports (optional if you want flashsocket)
    // Setup RedisStore for shared sockets
    if (process.env.COURSESHARK_REDIS_URI){
      var info = require('url').parse(process.env.COURSESHARK_REDIS_URI)
        , RedisStore = require('socket.io/lib/stores/redis')
        , redis  = require('socket.io/node_modules/redis')
        , pub    = redis.createClient(info.port, info.hostname)
        , sub    = redis.createClient(info.port, info.hostname)
        , client = redis.createClient(info.port, info.hostname)
      console.log("Using Redis for socket.io store");
      app.io.set('store', new RedisStore({
        redisPub : pub
      , redisSub : sub
      , redisClient : client
      }));
    }


    // Bootstrap controllers
    controller_loc = __dirname + '/controllers';
    controller_files = fs.readdirSync(controller_loc);
    controller_files.forEach( function (file) {
      require(controller_loc + '/' + file)(app);
    })


    // Build
    console.error('! Depreciating ./build.js in favor of Makefile')
    require('./build').build(app);


    console.log('CourseShark started on port ' + port);

  });
})



if ( process.env.NODE_ENV === 'production' ){
  console.log('Seatwatcher starting');
  seatwatcher.start();
}

// Connect to the Database
mongoose.connect(process.env.COURSESHARK_MONGODB_URI);
