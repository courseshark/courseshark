/**************************************************************
 *
 *   Schedule Code
 *
 *  All the methods specific to the schedule creator page
 *
 **************************************************************/
var term = {}
		, _terms = {length: 0}
		, schedule = {}
		, seat_workers_cnt = 15
		, seat_workers_i = 0
		, seat_workers = []
		, conflict_worker = 0
		, majors_updating = {}
		, tooltip_data = {}


function loadSeatData(id, child){
/*
	if ( school == 3 ) {
		sel = '#'+id+'[rel="section-option"]';
		console.log(sel);
		if ( child )
			major = $(sel).parent().parent().parent().children('.course-title').html().split(' ')[0];
		else
			major = $(sel).parent().parent().children('.course-title').html().split(' ')[0];

		if ( majors_updating[major] === undefined ){
			majors_updating[major] = [];
			dl_seat_info(id, child);
		}else if ( majors_updating[major] === true ){
			dl_seat_info(id, child);
		}else{
			majors_updating[major].push([id,child]);
			return;
		}
	}else{
		dl_seat_info(id, child);
	}
*/
}


function dl_seat_info(id, child){
		
	var sel = '[rel="section-option"]#'+id;
	if ( !$(sel+' > .section-seats').hasClass('loading') )
		return;
	
	/* if ( child )
	/	major = $(sel).parent().parent().parent().children('.course-title').html().split(' ')[0];
	/	else
	/	major = $(sel).parent().parent().children('.course-title').html().split(' ')[0];
	*/
	major = $(sel).data('section');
	major = section.major_abbr;
	
	
	if (Modernizr.webworkers) {
		if ( !seat_workers[seat_workers_i] ){
			seat_workers[seat_workers_i] = new Worker('/scripts/workers/seat_load.0.js');
			
			seat_workers[seat_workers_i].onmessage = function(event){
				var s = JSON.parse(event.data);
				s.sel = '[rel="section-option"]#'+s.id;
				$(s.sel+' > .section-seats').removeClass('loading');
				$(s.sel+' > .section-seats span.remaining').html(s.available_seats);
				$(s.sel+' > .section-seats span.total').html(s.total_seats);
				if ( parseInt(s.available_seats, 10) <= 0 ){
					id = s.id;
					var caff = window.tmpl($('#template-caffeine-bar').html(),{id:id});
					$(s.sel).append(caff);
				}
				
				
				if (  majors_updating[major] !== undefined &&  majors_updating[major] !== true ){
					queued_section = majors_updating[major].shift();
					while ( queued_section !== undefined ){
						dl_seat_info(queued_section[0], queued_section[1]);
						queued_section = ((mu = majors_updating[major]) ? mu.shift() : undefined);
					}
					majors_updating[major] = true;
				}
				
			};
			seat_workers[seat_workers_i].onerror = function(event){}
			
		}
		
		msg = {};
		msg.id = id;
		msg.child = child;
		msg.school = school;
		
		seat_workers[seat_workers_i].postMessage(JSON.stringify(msg));
		seat_workers_i = (seat_workers_i+1)%seat_workers_cnt;
		
	}else{
		$.ajax({
			url:"/schedule/section/"+id+"/seats",
			async: true,
			dataType: 'json',
			success: function(s){
				
				$(sel+' > .section-seats').removeClass('loading');
				$(sel+' > .section-seats span.remaining').html(s.available_seats);
				$(sel+' > .section-seats span.total').html(s.total_seats)
				if ( parseInt(s.available_seats, 10) <= 0 ){
					var caff = window.tmpl($('#template-caffeine-bar').html(),{id:id});
					$(sel).append(caff);
				}
				
				if (  majors_updating[major] !== undefined &&  majors_updating[major] !== true ){
					queued_section = majors_updating[major].shift();
					while ( queued_section !== undefined ){
						dl_seat_info(queued_section[0], queued_section[1]);
						queued_section = majors_updating[major].shift();
					}
					majors_updating[major] = true;
				}
			}
			});
	}
}
















































/***************************************************************************
 *
 * New Schedule  Code, cleaner and with standards
 *
***************************************************************************/
Storage = window.Storage || window.localStorage || {};
Storage.prototype.setObject = function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
}
Storage.prototype.getObject = function(key) {
		// :TODO: Add experation code
		return localStorage.getItem(key) && JSON.parse(localStorage.getItem(key));
}
function storeObject(name, obj){
	if ( Modernizr.localstorage ){
		localStorage.setObject(name, obj);
	}
}
function removeItem(name){
	if ( Modernizr.localstorage ){
		localStorage.removeItem(name);
	}
}
function getObject(name){
	if ( Modernizr.localstorage ){
		return localStorage.getObject(name);
	}
	return null;
}





var Schedule = function(term){
	this.term = (typeof term == 'object')?term:_terms[term]
	this.sections=[]
	this.name = "Schedule"
}
Schedule.fromObj = function(obj){
	obj.id = obj._id
	obj.term = typeof(obj.term)==="object"?obj.term:_terms[obj.term]
	if ( typeof(obj.sections) !== 'undefined' && obj.sections.length ){
		for (var s=0,len=obj.sections.length; s<len; s++){
			obj.sections[s].id = obj.sections[s]._id
		}
	}
	return $.extend(true, new Schedule(), obj);
}
Schedule.create = function(_term){
	schedule = new Schedule(_term);
	term = schedule.term;
	return schedule;
}
Schedule.load = function(id, next){
	next = (typeof next == 'undefined')?function(){}:next;
	$.ajax({
		url:"/schedule/load/"+id,
		type:'GET',
		dataType:'json',
		success:function(res){
			if ( res ){
				schedule = Schedule.fromObj(res);
				term = schedule.term;
				schedule.save(true);
			}
			schedule.show();
			next();
		}
	});
	return (Schedule(term));
}
Schedule.prototype.save = function(skipServer){
	
	if ( typeof(this.view) !== 'undefined' && this.view ){
		return;
	}
	storeObject("primary-schedule", schedule);
	updateScheduleConflicts();
	if ( typeof this.user !== 'undefined' && !skipServer ){
		$.ajax({
			url:"/schedule/save",
			data: {'schedule': JSON.stringify(schedule)},
			type:'PUT',
			dataType:'json',
			success:function(t){
				show_timed_message("Schedule Saved");
			}
		});
	}
	return this;
}
Schedule.prototype.pushSave = function(getId){
	self = this
	if ( typeof this.user !== 'undefined' ){
		self.save();
		return;
	}else if ( !getId ){
		openDialog("/schedule/save");
	}else{
		self.show();
		$.ajax({
			url:"/schedule/save",
			data: {'schedule': JSON.stringify(schedule)},
			type:'PUT',
			dataType:'json',
			success:function(res){
				console.log(res);
				self.id = this._id = res._id;
				self.user = res.user;
			}
		});
	}
}
	
Schedule.prototype.show = function(){
	schedule_start_hour = this.start_hour?this.start_hour:6;
	course_count = this.sections.length;
	
	document.title = 'Courseshark : '+this.name;

	$('#term-name').html(''+(this.term.season===null?'':this.term.season)+' '+(this.term.year===null?'':this.term.year));
	$('#schedule-summary #name').html(this.name);
	$('.course-options-container, [rel="section-timeslot"]').remove();
	
	for ( var i=0; i<course_count; i++ ){
		var section = this.sections[i]
		section.course = section.course || {id: section.course.id, major_abbr: section.department.abbr, number: section.course.number};
		times = addSectionToCalendar(section);
		for ( t=0; t<times.length; $(times[t]).show(),$(times[t]).hasClass('tbd-listing')?$('#tbd-container').show():{}, t++){}
		addCourseToList(section.course, section.id)
	}
	updateScheduleConflicts();
	this.updateHours();
	return this;
}
Schedule.prototype.addSection = function(section){
	section = (typeof section == 'object')?section:{id:section};
	this.sections.push(section);
	hilightSection(section.id);
	$('[rel="section-option"]#'+section.id).data('selected', true).addClass('selected').children('.children').slideDown();
	this.updateHours();
	return this;
}
Schedule.prototype.removeSection = function(section){
	section = (typeof section == 'object')?section:{id:section};
	for( i=0; i<this.sections.length; i++){
		if ( this.sections[i].id == section.id ){
			$this.data('selected', !$this.data('selected')).toggleClass('selected');
			this.sections.splice(i,1);
			i--;
		}
	}
	$('[rel="section-option"]#'+section.id).data('selected', false).removeClass('selected');
	unHilightSection(section.id);
	// Remove any children
	for ( var c in section.children ){
		child = section.children[c];
		$('[rel="section-option"]#'+child.id).removeClass('selected').data('selected', false);
		schedule.removeSection(child);
	}
	$('[rel="section-option"]#'+section.id).children('.children').slideUp();
	this.updateHours();
	return this;
}
Schedule.prototype.removeCourse = function(course){
	course = (typeof course == 'object')?course:{id:course};
	for( i=0; i<this.sections.length; i++){
		if ( this.sections[i].course.id == course.id ){
			unHilightSection(this.sections[i].id);
			$('[rel="section-option"]#'+this.sections[i].id).data('selected', false).removeClass('selected');
			this.sections.splice(i,1);
			i--;
		}
	}
	this.updateHours();
	return this;
}
Schedule.prototype.updateHours = function(){
	var credit_min = 0, credit_max = 0;
	addCredits = function(string){
		split = string.split('-');
		credit_min += parseInt(split[0], 10);
		if ( split.length == 2 ){
			credit_max += parseInt(split[1], 10);
		}
		else{
			credit_max += parseInt(split[0], 10);
		}
		refreshCreditDisplay();
	}
	refreshCreditDisplay = function(){
		var string = credit_min==credit_max?credit_min:''+credit_min+'-'+credit_max;
		$('#schedule-summary #hours #number').html(string);
	}
	for( var i in this.sections ){
		addCredits(this.sections[i].credits);
	}
	refreshCreditDisplay();
}
Schedule.prototype.testConflicts = function(section){
	if (Modernizr.webworkers) {
		if ( !conflict_worker ){
			conflict_worker = new Worker('/scripts/workers/schedule_conflict.1.js');
			conflict_worker.onmessage = function(event){
				var res = JSON.parse(event.data);
				if(res.conflicts && res.section){
					$('.section-option#'+res.section.id).addClass('conflicts');
					if ( !window.s_c && $('.section-option#'+res.section.id).hasClass('selected') ){
						window.s_c = true;
						showScheduleConflict("Schedule Has Conflicts !");
					}
				}else if ( res.section){
					$('.section-option#'+res.section.id).removeClass('conflicts');
				}
			}
		}
		conflict_worker.postMessage(JSON.stringify({schedule:this, section:section}));
	}else{
		if ( section && section.id && this.testConflictsSync(this, section) ){
			$('.section-option#'+section.id).addClass('conflicts');
			if ( !window.s_c && $('.section-option#'+section.id).hasClass('selected') ){
				window.s_c = true;
				showScheduleConflict("Schedule Has Conflicts !");
			}
		}else if ( section ){
			$('.section-option#'+section.id).removeClass('conflicts');
		}
	}
	return this;
}
Schedule.prototype.testConflictsSync = function (schedule, section, ignore_section){
	if ( !schedule.sections.length )
		return false;
	for ( var i in schedule.sections ){
		ss = schedule.sections[i]
		if ( ss.id == section.id || (ignore_section && ss.id == ignore_section.id))
			continue;
		for ( var t in ss.timeslots ){
			ts = ss.timeslots[t];
			st = parseInt(ts.start_hour*60, 10)+parseInt(ts.start_minute, 10);
			et = parseInt(ts.end_hour*60, 10)+parseInt(ts.end_minute, 10);
			for( var _t in section.timeslots ){
				_ts = section.timeslots[_t];
				_st = parseInt(_ts.start_hour, 10)*60+parseInt(_ts.start_minute, 10);
				_et = parseInt(_ts.end_hour, 10)*60+parseInt(_ts.end_minute, 10);
				if ( _ts.day == ts.day ){
					if ( _st <= et && _et >= st )
						return true;
					else if ( st <= _et && et >= _st )
						return true;
				}
			}
		}
	}
	return false;
}
Schedule.prototype._generateIcs = function(){
	var events, now, data, days, timeCombine, timeCombineTime, start, end, endParts, startParts, k
	days = {'monday':'MO','tuesday':'TU','wednesday':'WE','thursday':'TH','friday':'FR','saturday':'SA','sunday':'SU'}
	events = []
	endParts = term.endDate.split('-')
	startParts = term.startDate.split('-')

	for ( var i=0, section; (section=this['sections'][i]) !== undefined; i++ ){
		evnt = { name: section['major_abbr']+' '+section['course_number'], daysets: [] }
		timeCombine = {}
		timeCombineTime = {}
		for ( var j=0, ts; (ts=section['timeslots'][j]) !== undefined; j++ ){
			k = ''+ts.start_hour+"-"+ts.start_minute+"-"+ts.end_hour+"-"+ts.end_minute;
			start = new Date(parseInt(startParts[0],10), parseInt(startParts[1],10)-1, parseInt(startParts[2],10), ts.start_hour, ts.start_minute, 0)
			end = new Date(parseInt(startParts[0],10), parseInt(startParts[1],10)-1, parseInt(startParts[2],10), ts.end_hour, ts.end_minute, 0)
			if (!timeCombine[k]){
				timeCombine[k] = [];
				timeCombineTime[k] = { end: ''+dateFormat(end, "yyyymmdd")+'T'+dateFormat(end, "HHMMss"), location: ''+ts.location.building+' '+ts.location.room }
			}
			timeCombine[k].push(days[ts.day])
		}
		for ( var timeStr in timeCombine ){
			if ( typeof(timeStr) !== 'string'){
				continue;
			}
			weekOffset = 7;
			for ( j=0, _len = timeCombine[timeStr].length; j<_len; j++){
				d = timeCombine[timeStr][j];
				if ( d === 'MO' ){
					weekOffset = Math.min(weekOffset, 0);
				}else if ( d === 'TU' ){
					weekOffset = Math.min(weekOffset, 1);
				}
				else if ( d === 'WE' ){
					weekOffset = Math.min(weekOffset, 2);
				}
				else if ( d === 'TH' ){
					weekOffset = Math.min(weekOffset, 3);
				}
				else if ( d === 'FR' ){
					weekOffset = Math.min(weekOffset, 4);
				}
			}
			partsSplit = timeStr.split('-');
			ts = {start_hour: parseInt(partsSplit[0],10), start_minute: parseInt(partsSplit[1],10) }
			start = new Date(parseInt(startParts[0],10), parseInt(startParts[1],10)-1, parseInt(startParts[2],10)+weekOffset, ts.start_hour, ts.start_minute, 0)
			timeCombineTime[timeStr].start = ''+dateFormat(start, "yyyymmdd")+'T'+dateFormat(start, "HHMMss")
			evnt['daysets'].push( $.extend(timeCombineTime[timeStr], {days: timeCombine[timeStr].join(',')}) )
		}
		events.push(evnt);
	}
	now = new Date();
	termEndMonth = parseInt(endParts[1],10)-1===0?12:parseInt(endParts[1],10)-1;
	termEnd = new Date(parseInt(endParts[0],10), termEndMonth, parseInt(endParts[2],10), 23, 59, 59, 999);
	data = { name: this.name
		, timezone: 'America/New_York'
		, now: (''+dateFormat(now, "yyyymmdd")+'T'+dateFormat(now, "HHMMss"))
		, termEnd: (''+dateFormat(termEnd, "yyyymmdd")+'T'+dateFormat(termEnd, "HHMMss"))
		, events: events
		, user: 'contact@courseshark.com'
	};
	return window.tmpl($('#template-ical').html().replace(/\n/g, '#\n').trim(),data);
}
Schedule.prototype.createCal = function(){
	var resultLink = 'data:text/Calendar;base64,'
		, icsTxt;
	icsTxt = this._generateIcs().replace(/#\s*/g, "\r\n").trim();
	return resultLink+$.base64.encode(icsTxt);
}























function newSchedule(term){
	schedule = new Schedule(term);
}


function init(passed){
	// Load the terms
	
	if ( _terms.length === 0 ){
		$.ajax({
			url: "/schedule/terms",
			type: "GET",
			async: false,
			dataType: "json",
			success: function(t){
				var i, len, term
				for( i=0,len=t.length; i<len; i++ ){
					term = t[i]
					term.id = term._id
					_terms[term.id] = term
				}
				_terms.length = len
			}
		})
	}

	if ( passed === undefined ){
			// Load and show the primary schedule
		schedule=getObject("primary-schedule")
		if ( schedule ){
			schedule = Schedule.fromObj(schedule);
			term = schedule.term;
			if ( schedule.school != window.school ){
				removeItem("primary-schedule");
				init();
			}
			schedule.show();
		}else{
			$.ajax({
				url:"/schedule/load",
				async:true,
				type:'GET',
				dataType:'json',
				success: function(sc){
						schedule = Schedule.fromObj(sc);
						term = schedule.term
						schedule.show();
						storeObject("primary-schedule", schedule);
					}
			});
		}

		$(document).on('click', '[rel="remove"]', function(event){
			courseId = $(this).data('course');
			schedule.removeCourse(courseId);
			schedule.save();
			$('.course-options-container#'+courseId).remove();
		});
			
	}else{
		if ( typeof(passed) === 'string' ){
			passed = JSON.decode(passed)
		}
		schedule = Schedule.fromObj(passed);
		term = schedule.term;
		schedule.view = true;
		schedule.show(false);
	}

	$("#class-list").sortable({opacity: 0.6, cursor: 'move', axis:'vertically' });
	
	$(document).on('click', '[rel="toggle"]', function(event){
		$this = $(this);
		$container = $('.course-options-container#'+$this.data('course')+' .courses-options-wrapper');
		if ( $this.hasClass('collapse')){
			$container.slideUp();
			$this.removeClass('collapse').addClass('expand');
		}else{
			$bar = $('.course-options-container#'+$this.data('course'));
			if ($bar.data('skipping-seats') === true){
				$container.children('.section-option').each(function(){
					loadSeatData($(this).attr('id'));
				});
			}
			$container.slideDown();
			$this.removeClass('expand').addClass('collapse');
		}
	});

	$(document).on('mouseenter', '[rel="section-option"]', function(event){
		section = $(this).data('section');
		hilightSection(section.id);
	});
	$(document).on('mouseleave', '[rel="section-option"]', function(event){
		section = $(this).data('section');
		if ( $(this).data('selected') ){return;}
		unHilightSection(section.id);
	});
	$(document).on('click', '[rel="section-option"]', function(event){
		$this = $(this);
		section = $this.data('section');
		if ( $this.data('selected') ){
			schedule.removeSection(section);
			schedule.save();
		}else{
			schedule.addSection(section);
			schedule.save();
			if ( section.children ){
				for ( i=0; i<section.children.length; loadSeatData(section.children[i].id), i++){}
			}
			
		}
		return false;
	});
}


function addSectionToCalendar(section, scheduleId){
	var isFriendsSection = ( scheduleId !== undefined );
	if ( section.timeslots[0] === undefined ){
		section.timeslots[0] = false;
	}
	function rnd(seed) {
		if (!seed)
			seed = new Date().getTime();
		seed = (seed*9301+49297) % 233280;
		return seed/(233280.0);
	}
	section.color = '#'+(function(h){return new Array(7-h.length).join("0")+h})((rnd(section.number)*0x1000000<<0).toString(16))
	addedSlots = [];
	for ( var d = 0; d < section.timeslots.length; d++ ){
		var slot = section.timeslots[d]
			,	addedTimeslot
			,	html
			,	t = ( isFriendsSection )?''+d+scheduleId:d
			,	scale = 42.0
			, offset = 3.0


		slot.startTime = new Date(slot.startTime)
		slot.endTime = new Date(slot.endTime)

		if ( $('.option.'+section.id+(isFriendsSection?'.friend':'')+'#'+section.id+'-'+t).length ){
			continue;
		}

		// If we have a TBD timeslot
		if ( slot === false || slot.startTime.getHours() === 0 || slot.startTime == slot.endTime ){
			section.location = slot.location
			html = window.tmpl($('#template-event-listing-tbd').html(), {section:section, t:t, location: section.location});
			addedTimeslot = $(html).appendTo('#tbd-container #tbd-list');
		}else{
			top_offset = (slot.startTime.getHours() - 6 + (slot.startTime.getMinutes()/60.0)) * scale + offset;
			height = Math.floor(Math.max(1, (Math.abs( slot.endTime.getMinutes() - slot.startTime.getMinutes() )/60.0 + slot.endTime.getHours() - slot.startTime.getHours()) * scale + offset));
			startHourAdjusted = (slot.startTime.getHours()%12===0)?12:slot.startTime.getHours()%12;
			endHourAdjusted = (slot.endTime.getHours()%12===0)?12:slot.endTime.getHours()%12;
			html = window.tmpl($('#template-event-listing').html(), {
						section:section, slot:slot
					, t:t
					, startHourAdjusted: startHourAdjusted
					, endHourAdjusted: startHourAdjusted
					, height: height
					, top_offset: top_offset
				});

			for (var i=0,len=slot.days.length; i<len; i++){
				day = slot.days[i];
				addedTimeslot = $(html).appendTo('.wk-event-wrapper#'+day);
				for( var j=0,flen=section.friends.length; j<flen; j++ ){
					addedTimeslot.children(".friends-dots").append("<div class=\"friend-dot\" style=\"border-color: "+section.friends[j].color+"\"></div>");
				}
				addedTimeslot.css({'border-top':'3px solid '+section.color});

				if ( isFriendsSection ){
					addedTimeslot.css({'background':section.color});
					addedTimeslot.show().addClass('friend').data('scheduleId', scheduleId);
				}
				addedSlots.push(addedTimeslot);
			}
		}
	}
	setupTooltip(section);
	return addedSlots;
}





function addCourseToList(course, selectedSection){
	if ( $('.course-options-container#'+course.id).length ){
		return;
	}
	
	var course_container_el = window.tmpl($('#template-course-options').html(), {course: course});
	$('#class-list').prepend(course_container_el);
	var $bar = $('.course-options-container#'+course.id).show();
	var $container = $bar.children('.courses-options-wrapper');
	if ( selectedSection !== undefined ){
		$container.hide();
		$('[rel="toggle"][data-course="'+course.id+'"]').removeClass('collapse').addClass('expand');
	}
	$.ajax({
		beforeSend:function(jqXHR, settings){if ( !$('#class-list-loader').hasClass('showing') ){$('#class-list-loader').addClass('showing').show();}},
		complete:function(jqXHR, textStatus){$('#class-list-loader').hide(0,function(){$(this).removeClass('showing');});},
		url:"/sections/"+course.id,
		dataType: 'json',
		success: function(sections){
			if ( sections && sections.length > 0 ){
				for ( var i = 0; i < sections.length; i++){
					section = sections[i];
					section.id = section._id;
					section.course = course;
					section.department = section.course.department;
					if ( section.id ){
						addSectionToCourseList($container, section, selectedSection);
						addSectionToCalendar(section);
					}
				}
				if ( selectedSection === undefined ){
					$container.show();
				}else{
					$bar.data('skipping-seats', true);
				}
			}else{
				errorDialog('This course not offered this term');
			}
			// Code to hilight the selected ones
		}
	});
}





function addSectionToCourseList($container, section, selectedSection){
	var tbd_class = false;
	if ( section.timeslots[0] === undefined ){
		tbd_class = true;
	}
	else if ( section.timeslots[0].day == 'TBA' ){
		tbd_class = true;
	}
	// else if ( section.timeslots[0].start_minute === '' && section.timeslots[0].start_hour === '' ) {
	// 	tbd_class = true;
	// }
	// else if ( section.timeslots[0].end_minute === '' && section.timeslots[0].end_hour === '' ) {
	// 	tbd_class = true;
	// }
	section.tbd_class = tbd_class;
	
	sstemplate = $('#template-section-selector').html();
	if ( section.timeslots.length===0 ){
		section.instructor = 'TBA'
	}else{
		section.instructor = section.timeslots[0].instructor.trim().split(' ').splice(-1,1).join('')
	}
	section.friends = []
	section_selector = window.tmpl(sstemplate, {section: section, child: false});

	$sectionOption = $(section_selector).appendTo($container).data('section', section);
	
	if ( section.id === selectedSection ){
		$sectionOption.addClass('selected').data('selected', true);
	}
	
	//plotGpaOnCanvas($('canvas#gpa-for-'+section.id), section.gpa);
	
	if ( !selectedSection ){
		loadSeatData(section.id);
	}
	if ( section && window.schedule ){
		window.schedule.testConflicts(section);
	}
	
	if ( section.has_children && section.children && section.children[0].id && parseInt(section.children[0].id, 10) > 0){
		$sectionOption.data('parent', true);
		$childContainer = $('<div id="s_'+section.id+'" class="children"></div>').appendTo($sectionOption);
		for ( var c = 0; c < section.children.length; c++ ){
			addSectionToCourseList($childContainer, section.children[c], selectedSection||true);
			addSectionToCalendar(section.children[c]);
		}
	}
			
}





function setupTooltip(section){
	var txt = window.tmpl($('#template-section-info').html(),{section:section});
	$('.option.'+section.id).each(function(){
		$(this).popover({
			content: txt,
			delay: 100,
			trigger:'manual',
			placement: $(this).hasClass('tbd-listing')?'bottom':'right'
		})
		.on('click', function(){
			$(this).popover('hide');
			openDialog('/social/friends/invite-to-class/'+section.id).friendsSearch({next: inviteUsers, section: section.id});
		})
		.on('mouseenter', function(e) {
			e.stopPropagation();
			$('.option.'+section.id+':last').popover('show');
			that = this;
			$('.wk-event-listing.option, .tbd-listing.option').each(function(){
				$this = $(this);
				if ( that.id == this.id ){
					$this.removeClass('fade-out').addClass('fade-in');
				}else if ( $this.hasClass(section.id) && $this.hasClass('friend') === $(that).hasClass('friend')  ) {
					$this.removeClass('fade-out').addClass('fade-in');
				}else{
					$this.addClass('fade-out');
				}
					
			});
			
		})
		.on('mouseleave', function(e) {
			e.stopPropagation();
			$('.option.'+section.id+':last').popover('hide');
			
			$('.wk-event-listing.option, .tbd-listing.option').each(function(){
				$that = $(this);
				$that.removeClass('fade-out').removeClass('fade-in');
			});
			
		});
	});
}





function hilightSection(id){
	if ( $('.section-option#'+id).hasClass("TBA") ){
		$('#tbd-container').show();
		$('.tbd-listing.option.'+id+':not(.friend)').each(function(i){
			$(this).css({display:'block'});
		});
		return true;
	}
	$('.wk-event-listing.option.'+id+':not(.friend)').each(function(i){
		$(this).css({display:'block'});
	});
	return true;
}





function unHilightSection(id){
	if ( $('.section-option#'+id).attr('title') != 'selected'){
		if ( $('.section-option#'+id).hasClass("TBA") ){
			$('.tbd-listing.option.'+id.replace('child_','')).each(function(i){
				$(this).css({display:'none'});
			});
			var hide_all = true;
			$('.tbd-listing.option:not(.friend)').each(function(){
				if( $(this).css('display') == 'block'){
					hide_all = false;
				}
			});
			if ( hide_all ){
				$('#tbd-container').hide();
			}
			return true;
		}
		$('.wk-event-listing.option.'+id.replace('child_','')+':not(.friend)').each(function(i){
			$(this).css({display:'none'});
			});
	}
	return true;
}





function updateScheduleConflicts(){
	hide_schedule_conflict();
	window.s_c = false;
	$('.section-option').each(function(){
		schedule.testConflicts($(this).data('section'));
	});
}




function deleteSchedule(id){
	$.ajax({
		url: '/schedule/delete/'+id
	})
	return true;
}
