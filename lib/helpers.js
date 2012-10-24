everyauth = require('everyauth')

exports.boot = module.exports.boot = function(app){
	app.dynamicHelpers(
		{
			request: function (req){ return req; }
		,	loggedIn: function (req){ return (req.session && req.session.auth ) && (req.session.auth.loggedIn) }
		,	authToken: function (req){ return req.sessionID.toString().replace(/[^A-Fa-f0-9]/g,'') }
		,	hasMessages: function (req) {
				if (!req.session) return false;
				return Object.keys(req.session.flash || {}).length }
		,	messages: require('express-messages-bootstrap')
		, domain: function(){ return app.config.domain }
		, path: function(req){ return req['route']?req.route['path']:'' }
		,	base: function (){ return '/' == app.route ? '' : app.route }
		, revision: function(){return app.settings.revision}
		, mode: function(){return app.settings.env}
		, distinctId: function(req){return req.sessionID }
		, user: function(req){ return req.user || false }
	});

	app.helpers({
		numberize: function(number){
			var r = (''+number).substr(-1,1)
			return r==='1'?'st':r==='2'?'nd':r==='3'?'rd':'th'
		}
	})
}