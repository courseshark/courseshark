everyauth = require('everyauth')

exports.boot = module.exports.boot = function(app){
	app.dynamicHelpers(
		{
			request: function (req){ return req; }
		,	loggedIn: function (req){ return (req.session && req.session.auth ) && (req.session.auth.loggedIn) }
		,	hasMessages: function (req) {
				if (!req.session) return false;
				return Object.keys(req.session.flash || {}).length }
		,	messages: require('express-messages-bootstrap')
		, domain: function(){ return app.config.domain }
		, path: function(req){ return req['route']?req.route['path']:'' }
		,	base: function (){ return '/' == app.route ? '' : app.route }
		, revision: function(){return app.settings.revision}
		, mode: function(){return process.env.ENV_VARIABLE}
	});
}