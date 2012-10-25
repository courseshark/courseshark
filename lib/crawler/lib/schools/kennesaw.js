var banner = require('./banner')

var kennesaw = module.exports = banner.submodule('kennesaw')
	.fullName('Kennesaw State University')
	.location('Kennesaw GA 30144')
	.timezone('America/New_York')
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

	.redefine('loadTerms')
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

	.redefine('loadDepartmentSections')
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

