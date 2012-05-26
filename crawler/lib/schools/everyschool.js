var EventEmitter = require("events").EventEmitter
	,	fs = require('fs')


var everyschool = module.exports = {
	abbr: 'everyschool'
	,	name: ''
	,	fullName: function(n){
			this.name = String(n).trim()
			return this
		}
	, city: ''
	, state: ''
	, zip: ''
	, location: function(locationString){
			parts = String(locationString).split('').reverse().join('').split(/\s/,3)
			parts = parts.map(function(part){return part.split('').reverse().join('')}).reverse()
			this.city = parts[0]
			this.state = parts[1]
			this.zip = parts[2]
			return this
	}
	, _debug: false
	, debug: function(d){
			this._debug = !!d
			return this
		}
	, config: {}
	, configure: function(config){
			for (var prop in config) {
				if (config.hasOwnProperty(prop)) {
					this.config[prop] = config[prop];
				}
			}
			return this
		}
	, configurable: function(prop){
			if ( this.hasOwnProperty(prop) ){
				return this
			}
			this[prop] = function (setTo) {
				var k = '_' + prop;
				if (arguments.length) {
						this[k] = setTo
						this[prop] = setTo;
					return this
				}
			}
			return this
		}
	, mongoose: require('mongoose')
	, url: 0
	, paths: {}
	, rootUrl: function(url){
			this.url = url
			return this
		}
	, pagePaths: function(pathSet){
			this.paths = pathSet
			return this
		}




	,	_defining: 0
	,	howto: function(what){
			this[what] = (function(){
				return function(){
					return this.run(what, arguments)
				}})(what)
			this._defining = what;
			return this
		}
	, _returns: {}
	, returns: function(what){
			if ( !this._defining ){
				throw new Error("You must call howto() before defining a returns");
			}
			this._returns[this._defining] = what
			return this
		}

	, _steps: {}
	, _step: 0
	, step: function(name){
			if ( !this._defining ){
				throw new Error("You must call howto() before defining steps");
			}
			if ( !this._steps.hasOwnProperty(this._defining) ){
				this._steps[this._defining] = []
			}

			this._steps[this._defining].push({ name: name })
			this._step = name
			this.configurable(name)
			return this
		}

	, accepts: function(params){
			var steps = this._steps[this._defining]
			if ( !this._step || steps.length === 0 ){
				throw new Error("You must define a step before calling 'accepts'");
			}
			steps[steps.length-1].accepts = params.split(/\s+/);
			return this
		}

	, submodules: {}
	, submodule: function (abbr) {
			var self = this
				, submodule = this.submodules[abbr] = Object.create(this, {
						abbr: { value: abbr }
					, submodules: { value: {} }
					});
				return submodule;
		}


	, uses: function(system){
			sysModule = require('../'+system);
			Object.defineProperty(this, 'dl', {value: sysModule.downloader})
			Object.defineProperty(this, 'download', {value: sysModule.downloader.download})
			Object.defineProperty(this, 'structures', {value: sysModule.structures})

			this.configure(sysModule.config)
			this.dl.init(this)

			this.initStorage()
			
			for( var struct in sysModule.structures ){
				var structStore =  struct.toLowerCase()+'s'
					,	structAdd = 'add'+struct
				if ( !sysModule.structures.hasOwnProperty(struct) ){
					continue
				}
				this[structStore] = []
				this[structAdd] = (function(structStore, structName){
					return function(){
							newStruct = new sysModule.structures[structName](arguments)
							this[structStore].push(newStruct)
						}
					})(structStore, struct)
			}

			return this
		}


	, runningEvents: {}
	, run: function(method, args){
			if ( this._steps.hasOwnProperty(method) ){
				this.runningEvents[method] = new EventEmitter()
				this.callStep.apply(this, [{what: method, step:0}, args])
				return this.runningEvents[method]
			}else{
				throw new Error("School "+this.name+" does not know how to '"+method+"'")
			}
		}
	, callStep: function(){
			if ( this._debug ){
				console.log("===== Called with : ",arguments)
			}
			var args = arguments, self = this
			what = args[0]['what']
			stepNumber = args[0]['step']
			step = self._steps[what][stepNumber]
			passedArgs = []
			for ( var attr in args[1] ){
				if ( args.hasOwnProperty(attr) ){
					passedArgs.push(args[1][attr])
				}
			}
			if ( stepNumber == self._steps[what].length - 1){
				next = function(){ self.complete(what) }
			}else{
				next = function(){ self.callStep({what: what, step: stepNumber+1}, arguments)}
			}
			if ( step.hasOwnProperty('accepts') ){
				if ( passedArgs.length !== step.accepts.length ) {
					throw new Error('Step '+step.name+' accepts '+step.accepts.length+
						' arguments, but '+passedArgs.length+' were found')
				}
			}
			if ( this._debug ){
				console.log("  ++++ Calling next with args list : ",passedArgs)
				console.log(" -- Running ", step.name)
			}
			self[step.name].apply(self, passedArgs)
	}
	, complete: function(method){
			ret = this._returns[method]
			if ( ret ){
				this.runningEvents[method].emit('done', this[ret])
			}else{
				this.runningEvents[method].emit('done')
			}
			console.log('Completed', method);
		}

	, store: {}
	, initStorage: function(){
			var that = this
			,	store = {}
			,	model_loc = __dirname + '/../../../models'
			,	model_files = fs.readdirSync(model_loc)

			model_files.forEach( function (file) {
				require(model_loc + '/' + file).boot(store)
			})
			this.store = store
			this.structures.init(this.store)
		}

}
