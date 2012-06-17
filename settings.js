var express = require('express')
	, gzippo = require('gzippo')
	, mongoStore = require('connect-mongodb')
	, everyauth =	require('everyauth')
	, auth = require('./lib/authorization')
	, fs = require('fs');
	
exports.boot = function(app){
	bootApplication(app)
};

function bootApplication(app){

	logFile = fs.createWriteStream(app.config.logFile, {flags: 'a', encoding: null, mode: 666})
	auth.everyauthBoot(everyauth, app);
	
	app.configure(function(){
		app.set('views', __dirname + '/views')
		app.set('view engine', 'ejs')
		app.use(express.logger({stream: logFile}));
		app.use(express.bodyParser())
		app.use(require('./query-filter'))
		app.use(express.methodOverride())
		app.use(require('connect-less')({ src: __dirname + '/public/', compress: true, yuicompress: true }));
		app.use(gzippo.staticGzip(__dirname + '/public'))
		app.use(express.cookieParser())
		app.use(express.session({
			secret: 'c6b747964854ebfc8f1f8a42c232b6d3',
			store: new mongoStore({
				url: app.config.db.uri,
				collection : 'sessions'
			}),
			cookie : { domain : '.'+app.config.domain },
			domain : '.'+app.config.domain,
			httpOnly : true,
			maxAge : 1000*60*60*24*365
		}))
		app.use(everyauth.middleware())
		app.use(express.logger(':method :url :status'))
		app.use(express.favicon())
		app.use(require('./subdomains'))
		app.use(app.router)
		app.use(gzippo.compress())
		
	});

	everyauth.helpExpress(app);

	app.set('showStackError', false)
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	})
	app.configure('staging', function(){
		app.enable('view cache')
	})
	app.configure('production', function(){
	})

	try{
		gitHead = fs.readFileSync(__dirname+'/.git/refs/heads/master', 'utf-8').trim();
		app.set('revision', gitHead)
	}catch(e){
		app.set('revision', 'r'+(new Date()).getTime())
	}
}