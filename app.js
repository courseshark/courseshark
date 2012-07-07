var	express = require('express')
		, fs = require('fs')
		, config_file = require('yaml-config')
		, config = config_file.readConfig(__dirname + '/config.yaml')
		, auth = require('./lib/authorization')
		, utils = require('./lib/utils')
		,	browserify = require('browserify')
//		, appsec = express.createServer({key: privateKey, cert: certificate})
		, app = express.createServer()
		, port = (typeof process !== "undefined" && process !== null ? (_ref2 = process.env) !== null ? _ref2.PORT : undefined : undefined) || 80
		, sio = require('socket.io')
		, io = sio.listen(app)

app.config = config
app.io = io
io.set('log level', 1);

// Database
mongoose = require('mongoose')
mongoose.connectSet(config.db.uri, config.db.auth)
Schema = mongoose.Schema
ObjectId = mongoose.Types.ObjectId
// Bootsrap models
model_loc = __dirname + '/models'
model_files = fs.readdirSync(model_loc)
model_files.forEach( function (file) {
	require(model_loc + '/' + file).boot(app)
})

require('./lib/social-track').boot(app)
// Configuration
require('./lib/settings').boot(app, mongoose);
//Error Handler
require('./lib/error-handler').boot(app);
// Helpers
require('./lib/helpers').boot(app);
// make a global helper
requireLogin = auth.requireLogin
requireAdmin = auth.requireAdmin
requireSchool = utils.requireSchool
// Bootstrap controllers
controller_loc = __dirname + '/controllers'
controller_files = fs.readdirSync(controller_loc)
controller_files.forEach( function (file) {
	require(controller_loc + '/' + file)(app)
})
// Build
require('./build').build(app)
// Start the seat watcher
if ( String(process.argv[2]).toLowerCase()!='no-cron' ){
	require('./lib/seat-watcher').boot(app)
}

// Start the app by listening on <port>
app.listen(port)

console.log('CourseShark started on port ' + port);

