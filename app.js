/** Main application file
 * Kicks off the whole show
 */

var   express = require('express')
    , fs = require('fs')
    , auth = require('./lib/authorization')
    , utils = require('./lib/utils')
    , app = express.createServer()
    , port = (typeof process !== "undefined" && process !== null ? (_ref2 = process.env) !== null ? _ref2.PORT : undefined : undefined) || 80
    , sio = require('socket.io')
    , io
    , mongoose = require('mongoose')
    , config_file = require('yaml-config')
    , config = config_file.readConfig(__dirname + '/config.yaml', app.settings.env)
    , mixpanel = new require('mixpanel').Client(config.mixpanel.accessToken)


console.log("\n\nStarting in mode:", app.settings.env);

app.config = config;
app.mixpanel = mixpanel;
app.mixpanel.set_config({test: app.settings.env!="production", debug: app.settings.env=="development"});

// Socket.io
app.io = io = sio.listen(app);
app.io.enable('browser client minification');  // send minified client
app.io.enable('browser client etag');          // apply etag caching logic based on version number
app.io.enable('browser client gzip');          // gzip the file
app.io.set('log level', 1);                    // reduce logging
app.io.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket'
  , 'flashsocket'
  , 'xhr-polling'
  , 'jsonp-polling'
  , 'htmlfile'
]);

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
    // Helpers
    require('./lib/helpers').boot(app);
    // make a global helper
    requireLogin = auth.requireLogin;
    requireAdmin = auth.requireAdmin;
    requireSchool = utils.requireSchool;
    // Bootstrap controllers
    controller_loc = __dirname + '/controllers';
    controller_files = fs.readdirSync(controller_loc);
    controller_files.forEach( function (file) {
      require(controller_loc + '/' + file)(app);
    })
    // Build
    require('./build').build(app);
    // Start the app by listening on <port>
    app.listen(port);
    console.log('CourseShark started on port ' + port);
  });
})

// Connect to the Database
mongoose.connect(config.db.uri);
