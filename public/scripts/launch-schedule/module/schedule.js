	
	var _terms = {length: 0}
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
					if ( array_diff(_ts.days,ts.days).length || array_diff(ts.days,_ts.days).length ){
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
			console.log(evnt)
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

	define(function(require){
		return Schedule;
	})
