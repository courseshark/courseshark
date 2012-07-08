var crawler = module.exports = {}
	, config_file = require('yaml-config')
	, config = config_file.readConfig(__dirname + '/../../config.yaml')
	, mongoose = require('mongoose')
try{
	if ((process.env.NODE_ENV||'development') === 'development' ){
		mongoose.connect(config.db.uri)
	}else{
		mongoose.connectSet(config.db.uri)
	}
}catch(err){
	console.log(err);
}
crawler.modules = {};
crawler.enabled = {};


var fs = require('fs');
var files = fs.readdirSync(__dirname + '/lib/schools');
var includeSchools = files.map( function (fname) {
  return fname.substring(0, fname.length - 3);
});

for (var i=0, l=includeSchools.length; i < l; i++){
	var school = includeSchools[i]
	crawler[school] = require('./lib/schools/' + school)
	crawler[school]['mongoose'] = mongoose
}
