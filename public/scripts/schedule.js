/**************************************************************
 *
 *   Schedule Code
 *  
 *  All the methods specific to the schedule creator page
 * 
 **************************************************************/
var term 			    	= {},
 	schedule			    ,
 	seat_workers_cnt 	= 15,
 	seat_workers_i   	= 0,
 	seat_workers 	  	= Array(),
	conflict_worker 	= 0,
	majors_updating 	= Object();
	tooltip_data			= Object();


function loadSeatData(id, child){
	if ( school == 3 ) {
		if ( child )
			major = $(sel).parent().parent().parent().children('.course-title').html().split(' ')[0];
		else
			major = $(sel).parent().parent().children('.course-title').html().split(' ')[0];

		if ( majors_updating[major] === undefined ){
			majors_updating[major] = Array();
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
}


function dl_seat_info(id, child){
		
	var sel = '[rel="section-option"]#'+id;
	if ( !$(sel+' > .section-seats').hasClass('loading') )
		return;
	
	// if ( child )
	// 		major = $(sel).parent().parent().parent().children('.course-title').html().split(' ')[0];
	// 	else
	// 		major = $(sel).parent().parent().children('.course-title').html().split(' ')[0];
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
				$(s.sel+' > .section-seats span.total').html(s.total_seats)
				if ( parseInt(s.available_seats) <= 0 ){
					id = s.id;
					var caff = window.tmpl($('#template-caffeine-bar').html(),{id:id});
					$(s.sel).append(caff);
				}
				
				
				if (  majors_updating[major] !== undefined &&  majors_updating[major] !== true ){
					queued_section = majors_updating[major].shift();
					while ( queued_section !== undefined ){
						dl_seat_info(queued_section[0], queued_section[1]);
						queued_section = majors_updating[major].shift();
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
				if ( parseInt(s.available_seats) <= 0 ){
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
function getObject(name){
	if ( Modernizr.localstorage ){
		return localStorage.getObject(name);
	}
	return null;
}





var Schedule = function(term){
	this.term = (typeof term == 'object')?term:{id:term};
	this.sections = [];
	this.start_hour = 6;
	this.name = "Schedule";
}
Schedule.fromObj = function(obj){
	return $.extend(true, new Schedule(), obj);
}
Schedule.create = function(term){
	schedule = new Schedule(term);
	return schedule;
	// schedule.save();
	// schedule.show();
	// return schedule;
}
Schedule.load = function(id, next){
	next = (typeof next == 'undefined')?function(){}:next;
	$.ajax({
		url:"/schedule/"+id+"/load",
		type:'GET',
		dataType:'json',
		success:function(res){
			if ( res.success ){	
				schedule = Schedule.fromObj(res.message);
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
	
	storeObject("primary-schedule", schedule);
	updateScheduleConflicts();
	
	/// :TODO: silent ajax call to save on server
	if ( typeof this.id !== 'undefined' && !skipServer ){		
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
	if ( typeof this.id !== 'undefined' ){
		this.save();
		return;
	}else if ( !getId ){
		openDialog("/schedule/save");
	}else{
		this.show();
		$.ajax({
			url:"/schedule/save",
			data: {'schedule': JSON.stringify(schedule)},
			type:'POST',
			dataType:'json',
			success:function(res){
				if ( res.success ){
					this.id = res.message;
					show_timed_message("Schedule Saved");
				}
			}
		});
	}
}
	
Schedule.prototype.show = function(){
	schedule_start_hour = this.start_hour;
	course_count = this.sections.length;
	
	$('#term-name').html(''+(this.term.season==null?'':this.term.season)+' '+(this.term.year==null?'':this.term.year));			
	$('#schedule-summary #name').html(this.name);
	$('.course-options-container, [rel="section-timeslot"]').remove();
	
	for ( var i=0; i<course_count; i++ ){
		var section = this.sections[i]
		section.course = section.course || {id: section.course_id, major_abbr: section.major_abbr, number: section.course_number};
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
	for ( c in section.children ){
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
		if ( this.sections[i].course_id == course.id ){
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
		credit_min = credit_min + parseInt(split[0]);
		if ( split.length == 2 ){
			credit_max = credit_max + parseInt(split[1]);
		}
		else{
			credit_max = credit_max + parseInt(split[0]);
		}
		refreshCreditDisplay();
	}
	refreshCreditDisplay = function(){
		if( credit_min == credit_max ){
			var string = credit_min;
		}
		else{
			var string = credit_min+'-'+credit_max;
		}
		$('#schedule-summary #hours #number').html(string);
	}
	for( s in this.sections ){
		addCredits(this.sections[s].credits);
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
		function testConflictsSync(schedule, section, ignore_section){
			if ( !schedule.sections.length )
				return false;
			for ( i in schedule.sections ){
				ss = schedule.sections[i]
				if ( ss.id == section.id || (ignore_section && ss.id == ignore_section.id))
					continue;
				for ( t in ss.timeslots ){
					ts = ss.timeslots[t];
					st = parseInt(ts.start_hour*60)+parseInt(ts.start_minute);
					et = parseInt(ts.end_hour*60)+parseInt(ts.end_minute);
					for( _t in section.timeslots ){
						_ts = section.timeslots[_t];
						_st = parseInt(_ts.start_hour)*60+parseInt(_ts.start_minute);
						_et = parseInt(_ts.end_hour)*60+parseInt(_ts.end_minute);
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
		
		if ( section && section.id && testConflictsSync(this, section) ){
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


















function newSchedule(term){
	schedule = new Schedule(term);
}


function init(){
	// Load and show the primary schedule
	if ( schedule=getObject("primary-schedule"), schedule!=null ){
		schedule = Schedule.fromObj(schedule);
		term = schedule.term;
		schedule.show();
	}else{		
		$.ajax({
			url:"/schedule/load",
			async:true,
			type:'GET',
			dataType:'json',
			success: function(schedule){
					storeObject("primary-schedule", schedule);
					schedule = Schedule.fromObj(schedule);
					term = schedule.term;
					schedule.show();
				}
		});
	}
	
	$("#class-list").sortable({opacity: 0.6, cursor: 'move', axis:'vertically' });
	
	$(document).on('click', '[rel="remove"]', function(event){
		courseId = $(this).data('course');
		schedule.removeCourse(courseId);
		schedule.save();
		$('.course-options-container#'+courseId).remove();
	});
	
	$(document).on('click', '[rel="toggle"]', function(event){
		$this = $(this);
		$container = $('.course-options-container#'+$this.data('course')+' .courses-options-wrapper');
		if ( $this.hasClass('collapse')){
			$container.slideUp();
			$this.removeClass('collapse').addClass('expand');
		}else{
			$bar = $('.course-options-container#'+$this.data('course'));
			if ($bar.data('skipping-seats') == true){
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
			for ( i=0; i<section.children.length; loadSeatData(section.children[i].id), i++){};
		}
		return false;
	});
}





function addSectionToCalendar(section, scheduleId){
	var isFriendsSection = ( scheduleId !== undefined );
	if ( section.timeslots[0] == undefined ){
		section.timeslots[0] = false;
	}
	addedSlots = Array();
	for ( var d = 0; d < section.timeslots.length; d++ ){
		var slot = section.timeslots[d],
				addedTimeslot,
				html,
				t = ( isFriendsSection )?''+d+scheduleId:d;

  	if ( $('.option.'+section.id+(isFriendsSection?'.friend':'')+'#'+section.id+'-'+t).length ){
  		continue;
  	}
		// If we have a TBD timeslot 
		if ( slot == false || ( parseInt(slot.start_hour) == 0 || slot.start_hour == undefined ) && ( parseInt(slot.end_hour) == 0 || slot.end_hour == undefined ) ){	
			if ( slot == false || (slot.location.building == 'None' && slot.location.room == 'None' ) ){
				section_location = 'Location and time TBD';
			}else{
				section_location = slot.location.building + ' ' + slot.location.room;
			}
			html = window.tmpl($('#template-event-listing-tbd').html(), {section:section, t:t});
			addedTimeslot = $(html).appendTo('#tbd-container #tbd-list');
		}else{
			top_offset = ((parseFloat(slot.start_hour) - schedule_start_hour) + (parseFloat(slot.start_minute)/60.0)) * 42.0 + 3.0;
			height = Math.floor(Math.max(.5, Math.abs(parseFloat(slot.end_minute) - parseFloat(slot.start_minute))/60.0 + parseFloat(slot.end_hour) - parseFloat(slot.start_hour)) * 41.0 - 2);
			slot.start_hour_adj = (slot.start_hour%12==0)?12:slot.start_hour%12;
			slot.end_hour_adj = (slot.end_hour%12==0)?12:slot.end_hour%12;

			html = window.tmpl($('#template-event-listing').html(), {section:section, slot:slot, t:t});
			addedTimeslot = $(html).appendTo('.wk-event-wrapper#'+slot.day);
		}

		for( var i=0; i<section.friends.length; i++ ){
			addedTimeslot.children(".friends-dots").append("<div class=\"friend-dot\" style=\"border-color: "+section.friends[i].color+"\"></div>");
		}
		addedTimeslot.css({'border-top':'3px solid '+section.color});

		if ( isFriendsSection ){
			addedTimeslot.css({'background':section.color});
		  addedTimeslot.show().addClass('friend').data('scheduleId', scheduleId);
		}
		addedSlots.push(addedTimeslot);
	}
	// Tooltop construction
	//if ( typeof tooltip_data[section.id] === "undefined" ){
	//	tooltip_data[section.id] = 0;
		$.ajax({
				url:'/school/'+school+'/section/'+section.id+'/info',
				async: true,
				dataType: 'text',
				cache: true,
				success: function(data){
					tooltip_data[section.id] = data;
					setupTooltip(section, data);
				}
			});
	//}else{
	//	setupTooltip(section, tooltip_data[section.id]);
	//}
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
		url:"/school/"+school+"/course/"+course.id+"/term/"+term.id+"/sections",
		dataType: 'json',
		success: function(sections){
			if ( sections && sections.length > 0 ){
				for ( var i = 0; i < sections.length; i++){
					section = sections[i];
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
	tbd_class = false;
	if ( section.timeslots[0] == undefined ){
		tbd_class = true;
	}
	else if ( section.timeslots[0].day == 'TBA' ){
		 tbd_class = true;
	}
	else if ( section.timeslots[0].start_minute=='' && section.timeslots[0].start_hour=='' ) {
		tbd_class = true;
	}
	else if ( section.timeslots[0].end_minute=='' && section.timeslots[0].end_hour=='' ) {
		tbd_class = true;
	}
	section.tbd_class = tbd_class;
	
	sstemplate = $('#template-section-selector').html();

	section_selector = window.tmpl(sstemplate, {section: section, child: false});

	$sectionOption = $(section_selector).appendTo($container).data('section', section);
	
	if ( section.id === selectedSection ){
		$sectionOption.addClass('selected').data('selected', true);
	}
	
	//plotGpaOnCanvas($('canvas#gpa-for-'+section.id), section.gpa);
	
	if ( !selectedSection ){
		loadSeatData(section.id);
	}

	schedule.testConflicts(section);
	
	if ( section.has_children && section.children && section.children[0].id && parseInt(section.children[0].id) > 0){
		$sectionOption.data('parent', true);
		$childContainer = $('<div id="s_'+section.id+'" class="children"></div>').appendTo($sectionOption);
		for ( var c = 0; c < section.children.length; c++ ){
			addSectionToCourseList($childContainer, section.children[c], selectedSection||true);
			addSectionToCalendar(section.children[c]);
		}
	}
			
	$sectionOption.click(
		function(e) {
			return;
			/// :TODO: Remove this code !
			if( $(this).data('selected') == true )
			{
				if ( $(this).hasClass('parent') )
				{
					var id = $(this).attr('id');

					$(container+' > .children#s_'+id+' > .section-option.selected').each(function(){
												
						var child_id = $(this).attr('id');
						$.ajax({
							url:"/schedule/section/"+child_id.replace('child_','')+"/remove",
							dataType:'json',
							success: function(rschedule){
									if ( Modernizr.localstorage && store_local ){
										localStorage.setObject("courseshark.schedule.current", schedule);
									}
									schedule = rschedule;
									update_schedule_conflicts();
								}
							});						
						$(this).removeClass('selected');
						$(this).data('selected', false);
						unHilightSection(child_id);
						$('.seat-notification#'+$(this).attr('id').replace('child_','caffeine_')).slideUp();
						removeCredits($(this).attr('credits'));

					})
					
					$(container+' > .children#s_'+id).slideUp();
					
				}
				
				// Called when adding a class from a loaded schedule?
				$.ajax({
					url:"/schedule/section/"+$(this).attr('id')+"/remove",
					dataType:'json',
					success: function(rschedule){
							if ( Modernizr.localstorage && store_local ){
								localStorage.setObject("courseshark.schedule.current", rschedule);
							}
							schedule = rschedule;
							update_schedule_conflicts();
						}
					});
				removeCredits($(this).attr('credits'));
				
				$('.section-option#'+section.id+' > .seat-notification#caffeine_'+section.id).slideUp();
				$(this).removeClass('on-schedule');
				
				$(this).removeClass('selected');
				$(this).data('selected', false);
			}else{
				
				if ( $(this).hasClass('parent') ){
					var id = $(this).attr('id');
					$('.children').each(function(){
						if ( 's_'+id == $(this).attr('id') ){
							$(this).slideDown();
							$(this).children(".section-option").each(function(){
								obj = $(this).children(".section-seats");
								if ( obj.hasClass('loading') ){
									loadSeatData($(this).attr('id').replace('child_',''),true);
								}
							});
								
						}
					})
				}
				id = $(this).attr('id');
				if ( $(this).hasClass('on-schedule') == false ){

				}
				addCredits($(this).attr('credits'));
				$(this).addClass('selected');
				$(this).data('selected',true);
				$('.section-option#'+section.id+' > .seat-notification#caffeine_'+section.id).slideDown();
			}
	});
}





function setupTooltip(section, txt){
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