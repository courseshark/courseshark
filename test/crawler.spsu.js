(function(env){
	var crawler = require('../lib/crawler')
			, spsu
	
	console.log('Creating Crawler');
	console.assert(typeof(crawler) === 'object')
	
	console.log('Testing existance of spsu submodule')
	console.assert(typeof(crawler.spsu) === 'object')

	console.log('Crawling')
	crawl = crawler.spsu.crawl('201208')
	crawl.on('done', function(d){
		console.log('GOT DONE EVENT:', d.length, 'departments')
	})

})(this)