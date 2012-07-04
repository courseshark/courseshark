(function(env){
	var crawler = require('../crawler')
			, gt
	
	console.log('Creating Crawler');
	console.assert(typeof(crawler) === 'object')
	
	console.log('Testing existance of UNM submodule')
	console.assert(typeof(crawler.unm) === 'object')

	console.log('Crawling')
	crawl = crawler.unm.crawl('201280')
	crawl.on('done', function(d){
		console.log('GOT DONE EVENT:', d.length)
	})

	// console.log('Departments Sections')
	// gt.loadDepartmentSections(201208, new gt.structures.Department({0:'PSYC', 1:'Psychology'}))

})(this)