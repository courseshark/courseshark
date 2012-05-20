var banner = module.exports = {
		parser: require('./parser')
	, downloader: require('./downloader')
	, structures: require('./structures')
	, config: {
				seperateDepartments: true
			,	seatsListedWithSections: false
			,	sectionDetailsOnCrawl: false
	}
}