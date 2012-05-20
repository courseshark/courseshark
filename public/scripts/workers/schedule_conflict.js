self.onmessage = function (event) {	
	
	data = JSON.parse(event.data);
	schedule = data.schedule;
	section  = data.section;
	
	conflicts = testConflicts(schedule, section);
	
	res = data;
	res.conflicts = conflicts;
	res.section = section;
	
	self.postMessage(JSON.stringify(res));
};


function testConflicts(schedule, section, ignore_section){
	if ( !schedule.sections.length )
		return false;
		
	for ( i in schedule.sections ){
		ss = schedule.sections[i]
		if ( !ss || !section || ss.id == section.id || (ignore_section && ss.id == ignore_section.id))
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
