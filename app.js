/** Main application file
 * Kicks off the whole show
 */

//require('nodetime').profile({accountKey:'8ead2b63584790025132d7ec0456d88fcd4147e0',appName:'CourseShark Dev'});
var		express = require('express')
		, fs = require('fs')
		, config_file = require('yaml-config')
		, config = config_file.readConfig(__dirname + '/config.yaml')
		, auth = require('./lib/authorization')
		, utils = require('./lib/utils')
		, app = express.createServer()
		, port = (typeof process !== "undefined" && process !== null ? (_ref2 = process.env) !== null ? _ref2.PORT : undefined : undefined) || 80
		, sio = require('socket.io')
		, io = sio.listen(app)
		,	mongoose = require('mongoose')
		,	mixpanel = new require('mixpanel').Client(config.mixpanel.accessToken)

console.log("Starting in mode:", app.settings.env)

app.config = config
app.io = io
io.set('log level', 1);

if ( config.db.uri.indexOf(',') == -1 ){
	mongoose.connect(config.db.uri, function(err){if(err){console.log('mongoose-single:',err)}})
}else{
	mongoose.connectSet(config.db.uri, function(err){if(err){console.log('mongoose-rs:',err)}})
}
mongoose.connection.on('open', function(){

	Schema = mongoose.Schema
	ObjectId = mongoose.Types.ObjectId
	// Bootsrap models
	model_loc = __dirname + '/models'
	model_files = fs.readdirSync(model_loc)
	model_files.forEach( function (file) {
		require(model_loc + '/' + file).boot(app)
	})

	require('./lib/social-track').boot(app);
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
})


