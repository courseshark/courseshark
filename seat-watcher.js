/** Main application file
 * Kicks off the whole show
 */

var express = require('express')
	, fs = require('fs')
	, auth = require('./lib/authorization')
	, utils = require('./lib/utils')
	, mongoose = require('mongoose')
	, config_file = require('yaml-config')
	, config = config_file.readConfig(__dirname + '/config.yaml', process.env.NODE_ENV||'development')
	, NotificationSchema = require(__dirname + '/models/notification.js').NotificationSchema
	, DepartmentSchema = require(__dirname + '/models/department.js').DepartmentSchema
	, CourseSchema = require(__dirname + '/models/course.js').CourseSchema
	, SchoolSchema = require(__dirname + '/models/school.js').SchoolSchema
	, UserSchema = require(__dirname + '/models/user.js').UserSchema
	, TermSchema = require(__dirname + '/models/term.js').TermSchema
	, cronJob = require('cron').CronJob
	, watcher = require('./lib/seat-watcher').boot(config)

mongoose.connection.on('open', function(){

	var Notification = mongoose.model('Notification', NotificationSchema)
		,	Department = mongoose.model('Department', DepartmentSchema)
		,	Course = mongoose.model('Course', CourseSchema)
		,	School = mongoose.model('School', SchoolSchema)
		,	User = mongoose.model('User', UserSchema)
		,	Term = mongoose.model('Term', TermSchema)

	console.log("Initializing SeatWatcher ["+(process.env.NODE_ENV||'development')+"]");
	watcher.updateRunningSchools();

	schoolUdater = new cronJob({
			cronTime: '15,45 * * * * *'
		, onTick: function(){
				watcher.updateRunningSchools();
			}
		, start: true
	});

});
// Connect to the Database
mongoose.connect(config.db.uri);