var	express = require('express')
		, fs = require('fs')
		, config_file = require('yaml-config')
		, config = config_file.readConfig('config.yaml')
		, auth = require('./lib/authorization')
		, utils = require('./lib/utils')
		, app = express.createServer()
		, port = (typeof process !== "undefined" && process !== null ? (_ref2 = process.env) !== null ? _ref2.PORT : undefined : undefined) || 80
		, sio = require('socket.io')
		, io = sio.listen(app)

app.config = config
app.io = io
io.set('log level', 1);


// Database
mongoose = require('mongoose')
mongoose.connect(config.db.uri)
Schema = mongoose.Schema
ObjectId = mongoose.Types.ObjectId
// Bootsrap models
model_loc = __dirname + '/models'
model_files = fs.readdirSync(model_loc)
model_files.forEach( function (file) {
	require(model_loc + '/' + file).boot(app)
})
// Configuration
require('./settings').boot(app);
//Error Handler
require('./error-handler').boot(app);
// Helpers
require('./helpers').boot(app);
// make a global helper
requireLogin = auth.requireLogin
requireOrganizer = auth.requireOrganizer
requireSchool = utils.requireSchool
// Bootstrap controllers
controller_loc = __dirname + '/controllers'
controller_files = fs.readdirSync(controller_loc)
controller_files.forEach( function (file) {
	require(controller_loc + '/' + file)(app)
})

require('./build').build(app);

// Start the app by listening on <port>
app.listen(port)
console.log('Express app started on port ' + port);