var everySchool = require('./everyschool')

var kennesaw = module.exports = everySchool.submodule('kennesaw')
	.fullName('Kennesaw State University')
	.location('Kennesaw GA 30144')
	.uses('banner')
		.configure({})
	.rootUrl('owlexpress.kennesaw.edu')
	.pagePaths({
				termList: "/prodban/bwckschd.p_disp_dyn_sched"
			, term: "/prodban/bwckgens.p_proc_term_date"
			, listing: "/prodban/bwckschd.p_get_crse_unsec"
			, details: "/prodban/bwckschd.p_disp_detail_sched"
	})
	.debug(true)
	.howto('crawl')
		.returns('departments')
		.step('loadTerms')
			.accepts('term')
		.step('loadDepartments')
			.accepts('terms')
		.step('listSections')
			.accepts('term')
		.step('saveSelf')
		.step('storeResults')


	.howto('cacheCrawl')
		.returns('departments')
		.step('loadSelf')
		.step('storeResults')


	.howto('save')
		.step('storeResults')
		.step('closeDB')

	.configurable('saveSelf')
	.saveSelf(function(){
		var fs = require('fs')
		cacheJSON = {terms: this.terms, departments: this.departments}
		fs.writeFileSync(__dirname + '/../../cache/'+this.abbr+'.cache', JSON.stringify(cacheJSON))
		next()
	})

	.configurable('loadSelf')
	.loadSelf(function(){
		var fs = require('fs')
		cacheJSON = JSON.parse(fs.readFileSync(__dirname + '/../../cache/'+this.abbr+'.cache').toString())
		this.terms = cacheJSON.terms
		this.departments = cacheJSON.departments
		console.log(this.departments[1].courses['2100'].sections['82321'].timeslots);
		next()
	})


	.loadTerms(function(termUpdating){
		var self = this
		options = {host: self.url, path: self.paths.termList}
		self.download(options, function(window, html){
			var $ = window.$
			$('SELECT OPTION').each(function() {
				$this = $(this)
				if ( $this.val() ){
					termNames = $this.text().replace(/\s*\([^\)]+\)/, '').replace(/Semester\s/i,'').split(/\n/g)
					termName = termNames[0]
					termNumber = parseInt($this.val(), 10)
					if ( termNumber == termUpdating ){
						self.addTerm(termNumber, termName)
					}
				}
			})
			window.close()
			next(termUpdating)
		})
	})
	.loadDepartments(function(termUpdating){
		var self = this
			,	data = {p_calling_proc: "bwckschd.p_disp_dyn_sched", p_term: termUpdating}
			,	options = {host: self.url, path: self.paths.term, method: 'POST', data: data}
		this.dl.download(options, function(window, html){
			var $ = window.$
			$('SELECT[name="sel_subj"] OPTION').each(function(){
				$this = $(this)

				abbr = $this.val()
				text = $this.text().replace(/\n.*/g, '').replace(/[A-Z]{2,5}\-/, '')

				if ( abbr != '%' ){
					self.addDepartment(abbr, text)
				}
			})
			window.close()
			next(termUpdating)
		})
	})
	.listSections(function(termUpdating){
		var self = this
			, EventEmitter = require("events").EventEmitter
			,	emitter = new EventEmitter()
			function sleep(milliSeconds) {
				var startTime = new Date().getTime();
				while (new Date().getTime() < startTime + milliSeconds);
			}
		self.loadDepartmentSectionsCount++
		downloadLoop = function(d,deps){
			if ( d >= deps.length ){
				self.loadDepartmentSectionsCount--
				emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
				return
			}
			dep = deps[d]
			self.loadDepartmentSections(termUpdating, dep, emitter)
			setTimeout( function(){ downloadLoop(d+1, deps) }, 1000)
		}
		downloadLoop(0, this.departments)

		emitter.on('doneLoadingDept', function(numLeft){
			if (numLeft === 0){
				next(termUpdating);
			}
		})
	})
	.storeResults(function(termUpdating){
		this.structures.storeSchool(this, next)
	})
	.configurable('closeDB')
	.closeDB(function(){
		this.mongoose.disconnect()
		next()
	})



	.configurable('loadDepartmentSectionsCount')
	.loadDepartmentSectionsCount(0)
	.configurable('loadDepartmentSections')
	.loadDepartmentSections(function(termUpdating, department, emitter){
		var self = this
			,	options = {
						host: self.url
					, path: self.paths.listing
					, method: 'POST'
					, data: "term_in="+termUpdating+"&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj="+department.abbr+"&sel_crse=&sel_title=&sel_insm=%25&sel_from_cred=&sel_to_cred=&sel_camp=%25&sel_levl=%25&sel_ptrm=%25&sel_instr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a"
					, preserveData: true
					, referer: 'https://'+self.url+self.paths.term
				}
		self.loadDepartmentSectionsCount++
		self.dl.download(options, function(window, html){
			var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList
			if ( self.debug ){
				console.log("Recieved "+department.abbr+" listing")
			}
			$table = $('table.datadisplaytable[summary="This layout table is used to present the sections found"]')
			$sections = $table.find('.ddlabel[scope="row"]') // list of TH elements
			if ( $sections.length ){
				$sections.each(function(){



					var $sectionHead, sectionNameString, $sectionNumericDetails
						,	numbersArray, $sectionStringDetails, $stringDeatilsTRs
						, crn, creditParts, credits, termLength, seatsTotal
						,	seatsAvailable, title
						, course
						, section = new self.structures.Section()


					$sectionHead = $(this); // TH element

					sectionNameString = $sectionHead.text().trim();

					// Extract information from the title

					titleParts = sectionNameString.match(/^([A-Z]{2,4})\s+([0-9]{3,}[A-Z]*)\/([^\s]+)\s+\-\s+([^$]+)$/i)
					if ( !titleParts ){ console.log(sectionNameString)}
					dep = titleParts[1];
					cNum = titleParts[2];
					sNum = titleParts[3];
					cName = titleParts[4];
					
					// Find the proper course ( or create if need be )
					course = department.findOrAddCourseByNumber(cNum, cName);

					// Extract information from the numbers row
					$sectionNumericDetails = $sectionHead.parent().next(); // TR Element

					numbersArray = $sectionNumericDetails.text()	// Just get the text of the whole table
														.trim()	// Trims excess spaces
														.split(/\n/)	// Split based on new lines
														.map(function(e){return e.trim();}) // Trim each resulting number
														.splice(7); // Remove header text and blank space

					crn = numbersArray[0].trim();

					creditParts = numbersArray[1].match(/([\.\d]+)\s*(?:TO\s+([\.\d]+)\s+)?/i)
					if ( creditParts ){
						if ( creditParts[2] !== undefined ){
							credits = ''+parseInt(creditParts[1],10)+'-'+parseInt(creditParts[2],10);
						}else{
							credits = ''+parseInt(creditParts[1],10);
						}
					}else{
						console.log('Couldn\'t find credits for',sectionNameString, '--defaulting to 3');
						credits = 3;
					}

					termLength = numbersArray[2].trim();

					seatsTotal = parseInt(numbersArray[3].trim(),10);

					seatsAvailable = parseInt(numbersArray[5].trim(),10);


					// Extract information from the String rows


					$sectionStringDetails = $sectionNumericDetails.next() // TR Element
					$stringDetailsTable = $($sectionStringDetails.find('table')[0]);
					$stringDeatilsTRs = $($stringDetailsTable.children().splice(1)); // Remoce header row
					$stringDeatilsTRs.each(function(i, row){
						var columns = $(row).children()
							,	campus, locationParts, dayNumbers, timeParts
							, timeTBA, type, startDate, endDate, instructor
							, timeslot = new self.structures.Timeslot()

						// Campus String
						campus = $(columns[0]).text();
						
						// Location array ['building', 'room']
						locationParts = $(columns[1]).html().split(/<\s*br\s*\/?>/); // 0=>building, 1=>room
						if ( locationParts.length == 1 && locationParts[0].match(/TBA/) ){
							locationParts = ['TBA', ''];
						}
						
						// Get an array of days [0,6]
						if ( $(columns[2]).text().trim().match('/TBA/i') ){
							dayNumbers = [];
						}else{
							dayNumbers = [];
							$(columns[2]).find('td')
								.each( function(i, e){
									if( $(e).text().trim().match(/x/i) ){
										dayNumbers.push(i%7);
									}
								});
							//console.log(dayNumbers);
						}
						
						timeParts = $(columns[3]).text().match(/^([0-9]{0,2}:[0-9]{0,2}\s*[a|p]m)\s*\-\s*([0-9]{0,2}:[0-9]{0,2}\s*[a|p]m)/);
						timeTBA = !timeParts;

						type = $(columns[3]).text().match(/m([a-z]+)\s*$/i);
						
						startDate = $(columns[4]).text().trim();
						endDate = $(columns[5]).text().trim();

						instructor = $(columns[6]).text().replace(/\s*\([A-Z]\)/g, '').trim();

						timeslot.setDays(dayNumbers);
						timeslot.setStartDate(startDate);
						timeslot.setEndDate(endDate);
						if ( !timeTBA ){
							timeslot.setStartTime(timeParts[0])
							timeslot.setEndTime(timeParts[1])
						}
						timeslot.type = type?type[1]:'';
						timeslot.instructor = instructor;
						timeslot.location = locationParts[0]+' '+locationParts[1];
						
						section.timeslots.push(timeslot);

					}); // End string details loop

					section.number = crn // CRN
					section.sectionId = sNum // Section specifier ( ex: A, 001, H2, etc )
					section.credits = credits;
					section.instructor = section.timeslots[0]?section.timeslots[0].instructor:'';
					section.seatsTotal = seatsTotal;
					section.seatsAvailable = seatsAvailable;
					//Add to course
					course.addSection(section);
					//console.log(section);
				}) // end foreach section
	
			}else{
				console.log('--not-section--',department)
				exit();
			}
			window.close()
			self.loadDepartmentSectionsCount--
			emitter.emit('doneLoadingDept', self.loadDepartmentSectionsCount)
		})
	})


	.configurable('safeUpdateSection')
	.configurable('updateSection')
	.updateSection(function(section, callback){
		var self = this

		Term.findOne(section.term).exec(function(err, term){
			downloadHelper(section, term, callback);
		})

		downloadHelper = function(section, term, callback){
			var data = {
							term_in: ''+term.number
						,	crn_in: ''+section.number
					}
				,	options = {host: self.url, path: self.paths.details, method: 'GET', data: data}
			self.dl.download(options, function(window, html){
				var $ = window.$, $table, $sectionHead, $sectionDetails, $sectionDetailsContainer, $sectionDetailsList, update = {}
				$numbers = $('.dddefault').filter(function(){return (/^[0-9\-]+$/).test($(this).text())})
				update.seatsTotal = parseInt($numbers.eq(0).text(), 10)
				avail = $numbers.eq(1).text()
				update.seatsAvailable = remain = parseInt($numbers.eq(2).text(),10)
				if ( $numbers.length === 6 ){
					update.waitSeatsTotal = parseInt($numbers.eq(3).text(), 10)
					waitAvail = $numbers.eq(4).text()
					update.waitSeatsAvailable = waitRemain = parseInt($numbers.eq(5).text(),10)
				}
				update.updated = new Date()
				Section.update({_id: section._id, course: section.course, term: term.id},{$set: update }).exec(function(err){
					callback(err, section)
				})
			})
		}
	})

	.safeUpdateSection(function(section, expires, callback){
		var updated = new Date(section.updated).getTime()
			,	now = (new Date()).getTime()
		if ( updated + expires < now || !section.seatsAvailable ){
			this.updateSection(section, callback)
		}else{
			callback(undefined, section)
		}
	})


