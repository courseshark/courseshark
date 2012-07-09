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
		, seats = io.connect('/seats')
		,	array_diff = function(o,a){return o.filter(function(e){return(!(a.indexOf(e)>-1))})}

seats.on('result', function(data){
	var id = data.id
	$sel = $('[rel="section-option"]#'+id+' .section-seats')
	if ( $sel.length === 0 ){
		return;
	}
	$sel.removeClass('loading')
	$sel.children('.remaining').html(data.avail)
	$sel.children('.total').html(data.total)
})

function loadSeatData(id){
	seats.emit('update', id)
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
				show_timed_message("saved");
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
		section.course.department = typeof section.course.department == 'object'?section.course.department:section.department
		addCourseToList(section.course, section.id)
	}
	return this;
}
Schedule.prototype.addSection = function(section){
	section = (typeof section == 'object')?section:{id:section};
	this.sections.push(section);
	hilightSection(section.id);
	$('[rel="section-option"]#'+section.id).data('selected', true).addClass('selected').children('.children').slideDown();
	this.update();
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
	this.update();
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
	this.update();
	return this;
}

Schedule.prototype.update = function(){
	this.updateHours();
	this.updateCRN();
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

Schedule.prototype.updateCRN = function(){
	var numbers = []
		,	section;
	for(var i=0,len=this.sections.length; i<len; i++){
		section = this.sections[i];
		name = section.name.replace(/\s+#[0-9]+/,'')
		numbers[numbers.length] = section.number + "&nbsp;&nbsp;" + name;
	}
	$('#crn-list').html(numbers.join("<br />"));
}

Schedule.prototype.testConflicts = function(section){
	if ( false && Modernizr.webworkers ) {
		if ( !conflict_worker ){
			conflict_worker = new Worker('/scripts/workers/schedule_conflict.js');
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
		if ( !ss || !section || ss.id == section.id || (ignore_section && ss.id == ignore_section.id))
			continue;
		for ( var t=0,tlen=ss.timeslots.length; t<tlen; t++ ){
			ts = ss.timeslots[t];
			for( var _t=0,_tlen=section.timeslots.length; _t<_tlen; _t++ ){
				_ts = section.timeslots[_t];

				if ( array_diff(_ts.days,ts.days).length!==_ts.days.length || array_diff(ts.days,_ts.days).length!==ts.days.length ){
					if ( _ts.startTime <= ts.endTime && _ts.endTime >= ts.startTime )
						return true;
					else if ( ts.startTime <= _ts.endTime && ts.endTime >= _ts.startTime )
						return true;
				}
			}
		}
	}
	return false;
}
Schedule.prototype._generateIcs = function(){
	var events, now, data, days, timeCombine, timeCombineTime, start, end, k
	days = {'monday':'MO','tuesday':'TU','wednesday':'WE','thursday':'TH','friday':'FR','saturday':'SA','sunday':'SU'}
	events = []
	for ( var i=0, section; (section=this['sections'][i]) !== undefined; i++ ){
		evnt = { name: section['major_abbr']+' '+section['course_number'], daysets: [] }
		timeCombine = {}
		timeCombineTime = {}
		for ( var j=0, ts; (ts=section['timeslots'][j]) !== undefined; j++ ){
			startString = ''+dateFormat(ts.startTime, "yyyymmdd")+'T'+dateFormat(ts.startTime, "HHMMss")
			endString = ''+dateFormat(ts.endTime, "yyyymmdd")+'T'+dateFormat(ts.endTime, "HHMMss")
			k = startString+'---'+endString
			if (!timeCombine[k]){
				timeCombine[k] = [];
				timeCombineTime[k] = {
						start: startString
					,	end: endString
					, location: ''+ts.location
					, endDate: ''+dateFormat(ts.endDate, "yyyymmdd")+'T'+dateFormat(ts.endTime, "HHMMss")
					}
			}
			timeCombine[k] = ts.days.map(function(v,i){ return days[v]; })
		}
		for ( var timeStr in timeCombine ){
			evnt['daysets'].push( $.extend(timeCombineTime[timeStr], {days: timeCombine[timeStr].join(',')}) )
		}
		events.push(evnt);
	}
	now = new Date();
	data = { name: this.name
		, timezone: 'America/New_York'
		, now: (''+dateFormat(now, "yyyymmdd")+'T'+dateFormat(now, "HHMMss"))
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
			passed = JSON.parse(passed)
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
			, height_offset = -10.0


		slot.startTime = new Date(slot.startTime)
		slot.endTime = new Date(slot.endTime)
		slot.endDate = new Date(slot.endDate)

		if ( $('.option.'+section.id+(isFriendsSection?'.friend':'')+'#'+section.id+'-'+t).length ){
			continue;
		}

		// If we have a TBD timeslot
		if ( slot === false || slot.startTime.getUTCHours() === 0 || slot.startTime == slot.endTime ){
			section.location = slot.location
			html = window.tmpl($('#template-event-listing-tbd').html(), {section:section, t:t, location: section.location});
			addedTimeslot = $(html).appendTo('#tbd-container #tbd-list');
		}else{
			top_offset = (slot.startTime.getUTCHours() - 6 + (slot.startTime.getUTCMinutes()/60.0)) * scale + offset;
			height = Math.floor(Math.max(1, (Math.abs( slot.endTime.getUTCMinutes() - slot.startTime.getUTCMinutes() )/60.0 + slot.endTime.getUTCHours() - slot.startTime.getUTCHours()) * scale + offset)) + height_offset;
			startHourAdjusted = (slot.startTime.getUTCHours()%12===0)?12:slot.startTime.getUTCHours()%12;
			endHourAdjusted = (slot.endTime.getUTCHours()%12===0)?12:slot.endTime.getUTCHours()%12;
			html = window.tmpl($('#template-event-listing').html(), {
						section:section
					, slot:slot
					, t:t
					, startHourAdjusted: startHourAdjusted
					, endHourAdjusted: startHourAdjusted
					, height: height
					, top_offset: top_offset
				});

			for (var i=0,len=slot.days.length; i<len; i++){
				day = slot.days[i];
				addedTimeslot = $(html).appendTo('.wk-event-wrapper#'+day);
				for( var j=0,flen=(section.friends||[]).length; j<flen; j++ ){
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
	course.id = (course._id||course.id)
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
		url:"/term/"+schedule.term.id+"/sections/"+(course._id||course.id),
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
	else if ( section.timeslots[0].day === 'TBA' || section.timeslots[0].day === null){
		tbd_class = true;
	}

	section.tbd_class = tbd_class;
	
	sstemplate = $('#template-section-selector').html();
	if ( section.timeslots.length===0 ){
		section.instructor = 'TBA'
	}else{
		//section.instructor = section.timeslots[0].instructor.trim().split(' ').splice(-1,1).join('')
	}
	section.friends = []
	section_selector = window.tmpl(sstemplate, {section: section, child: false});

	$sectionOption = $(section_selector).appendTo($container).data('section', section);
	
	if ( section.id === selectedSection ){
		$sectionOption.addClass('selected').data('selected', true);
		schedule.testConflicts(section);
	}
	
	//plotGpaOnCanvas($('canvas#gpa-for-'+section.id), section.gpa);
	
	if ( !selectedSection ){
		loadSeatData(section.id);
	}
	
	if ( section.has_children && section.children && section.children[0].id && parseInt(section.children[0].id, 10) > 0){
		$sectionOption.data('parent', true);
		$childContainer = $('<div id="s_'+section.id+'" class="children"></div>').appendTo($sectionOption);
		for ( var c = 0; c < section.children.length; c++ ){
			addSectionToCourseList($childContainer, section.children[c], selectedSection||true);
			addSectionToCalendar(section.children[c]);
		}
	}
	updateScheduleConflicts();
	schedule.update();
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
	$('[rel="section-option"]').each(function(){
		schedule.testConflicts($(this).data('section'));
	});
}




function deleteSchedule(id){
	$.ajax({
		url: '/schedule/delete/'+id
	})
	return true;
}
