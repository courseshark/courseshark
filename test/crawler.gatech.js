(function(env){
	var crawler = require('../crawler')
			, gt
	
	console.log('Creating Crawler');
	console.assert(typeof(crawler) === 'object')
	
	console.log('Testing existance of gatech submodule')
	console.assert(typeof(crawler.gatech) === 'object')

	console.log('Crawling')
	crawl = crawler.gatech.crawl('201108')
	crawl.on('done', function(d){
		console.log('GOT DONE EVENT:', d.length)
	})


	// console.log('Departments Sections')
	// gt.loadDepartmentSections(201208, new gt.structures.Department({0:'PSYC', 1:'Psychology'}))

})(this)