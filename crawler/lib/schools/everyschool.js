var EventEmitter = require("events").EventEmitter

var everyschool = module.exports = {
	name: "everyschool"

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
	, submodule: function (name) {
			var self = this
				, submodule = this.submodules[name] = Object.create(this, {
						name: { value: name }
					, submodules: { value: {} }
					});
				return submodule;
		}


	, uses: function(system){
			sysModule = require('../'+system);
			Object.defineProperty(this, 'downloader', {value: sysModule.downloader})
			Object.defineProperty(this, 'download', {value: sysModule.downloader.download})
			Object.defineProperty(this, 'parser', {value: sysModule.parser})
			Object.defineProperty(this, 'structures', {value: sysModule.structures})

			this.configure(sysModule.config)

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
				this.callStep.apply(this, [{what: method, step:0}, args])
				return this.runningEvents[method] = new EventEmitter()
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
			}
			self[step.name].apply(self, passedArgs)
	}
	, complete: function(method){
			ret = this._returns[method]
			this.runningEvents[method].emit('done', this[ret])
			//console.log('Completed', method);
		}



}
