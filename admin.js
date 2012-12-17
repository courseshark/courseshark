/**
 * Admin application
 */

var express = require('express')
  , fs = require('fs')
  , auth = require('./lib/authorization')
  , utils = require('./lib/utils')
  , app = express.createServer()
  , port = (typeof process !== "undefined" && process !== null ? (_ref2 = process.env) !== null ? _ref2.PORT : undefined : undefined) || 80
  , mongoose = require('mongoose')
  , config_file = require('yaml-config')
  , config = config_file.readConfig(__dirname + '/config.yaml', app.settings.env)

console.log("\n\nStarting in mode:", app.settings.env);

app.config = config;
// Socket.io


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
  // Configuration
  require('./lib/settings').boot(app, mongoose);
  // Helpers
  require('./lib/helpers').boot(app);
  // make a global helper
  requireLogin = auth.requireLogin;
  requireAdmin = auth.requireAdmin;
  requireSchool = utils.requireSchool;
  // Bootstrap controllers
  controller_loc = __dirname + '/controllers/admin';
  controller_files = fs.readdirSync(controller_loc);
  controller_files.forEach( function (file) {
    require(controller_loc + '/' + file)(app);
  })
  // Build
  require('./build').build(app);
  // Start the app by listening on <port>
  app.listen(port);
  console.log('CourseShark started on port ' + port);
})

// Connect to the Database
mongoose.connect(config.db.uri);
