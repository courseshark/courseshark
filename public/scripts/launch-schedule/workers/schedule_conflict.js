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

array_diff = function(o,a) {
	if ( !o || !a ){ return []; }
	return o.filter(function(e) {return (a.indexOf(e) <= -1)})||[];
};


function testConflicts(schedule, section, ignore_section){
	if ( !schedule.sections.length )
		return false;
	for ( var i in schedule.sections ){
		ss = schedule.sections[i]
		if ( !ss || !section || ss.id == section.id || (ignore_section && ss.id == ignore_section.id))
			continue;
		for ( var t=0,tlen=ss.timeslots.length; t<tlen; t++ ){
			ts = ss.timeslots[t];
			if ( !ts ){ continue; }
			ts.days = ts.days || [];
			for( var _t=0,_tlen=section.timeslots.length; _t<_tlen; _t++ ){
				_ts = section.timeslots[_t];
				if ( !_ts ){ continue; }
				_ts.days = _ts.days || [];
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
