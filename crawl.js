(function(env){
	var school = ''
		,	term = ''
		,	config_file = require('yaml-config')
		, config = config_file.readConfig(__dirname + '/config.yaml')
		, mongoose = require('mongoose')

	if ((process.env.NODE_ENV||'development') === 'development' ){
		mongoose.connect(config.db.uri)
	}else{
		mongoose.connectSet(config.db.uri)
	}

	if ( process.argv.length < 4 ){
		console.log('Error: usage is `node crawl.js [school.abbr] [term.number]`')
		return;
	}else{
		school = process.argv[2].toLowerCase()
		term = parseInt(process.argv[3],10)+''
	}

	var crawler = require('./lib/crawler')

	if ( typeof crawler[school] !== 'object' ){
		console.log('Error: No such school '+school)
		return;
	}


	if ( process.argv.length >= 5 ){
		if ( process.argv[4].toLowerCase() === 'cache' ){
			crawl = crawler[school].cacheCrawl()
			crawl.on('done', function(d){
				console.log('Finished Storing Cache:', school)
				crawler[school]['mongoose'].connection.close()
			})
			return;
		}
	}
	crawl = crawler[school].crawl(term)
	crawl.on('done', function(d){
		console.log('Finished Crawling:', school)
		crawler[school]['mongoose'].connection.close()
	})
	

})(this)