(function(env){

	var school = ''
		,	term = ''

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

	crawl = crawler[school].crawl(term)
	crawl.on('done', function(d){
		console.log('Finished Crawling:', school)
		crawler[school]['mongoose'].connection.close()
	})
})(this)