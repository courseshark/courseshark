var crawler = module.exports = {};

crawler.modules = {};
crawler.enabled = {};


var fs = require('fs');
var files = fs.readdirSync(__dirname + '/lib/schools');
var includeSchools = files.map( function (fname) {
  return fname.substring(0, fname.length - 3);
});

for (var i=0, l=includeSchools.length; i < l; i++){
	var school = includeSchools[i]
	Object.defineProperty(crawler, school, {
		value: require('./lib/schools/' + school)
	});
}
