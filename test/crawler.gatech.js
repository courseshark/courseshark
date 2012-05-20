(function(env){
	var crawler = require('../crawler')
			, gt
	
	console.log('Creating Crawler');
	console.assert(typeof(crawler) === 'object')
	
	console.log('Testing existance of gatech submodule')
	console.assert(typeof(crawler.gatech) === 'object')

	gt = crawler.gatech

	console.log('Crawling')
	crawl = gt.crawl('201208')
	
	crawl.on('done', function(d){
		console.log('GOT DONE EVENT:', d)
	})

	// console.log('Departments Sections')
	// gt.loadDepartment(201208, new gt.structures.Department({0:'SPAN', 1:'Spanish'}))

})(this)