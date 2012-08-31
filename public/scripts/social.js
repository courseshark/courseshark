



(function(window, document, undefined){
	

	var friendSchedule = {};
	var sectionFriends = {};


	$('.friend-available:not(.none)').live('click', function(){
	  $this = $(this);
		scheduleId = $this.toggleClass('showing').data('schedule');
		color = $this.data('color');
		console.log(friendSchedule[$this.data('friend-id')], $this.data('friend-id'));
	});
	$('.friend-schedule').live('click', function(){
		$this = $(this);
		scheduleId = $this.toggleClass('showing').data('schedule');
		console.log(friendSchedule[$this.data('friend-id')]);
	});


	function rnd(seed) {
		if (!seed)
			seed = new Date().getTime();
		seed = (seed*9301+49297) % 233280;
		return seed/(233280.0);
	}


	initFriends = function(){
		$.ajax({
					url: '/friends/schedules/terms/'+window.schedule.term.id
				,	dataType: 'json'
				,	success: function(d){
						friendSchedule = d;
						var $rightBar = $('#right-bar').append('<div id="friends"><h2>Friends</h2></div>')
							,	$list = $('<div id="friends-list"><div>').appendTo('#friends')
						for(var i=0,len=d.length; i<len; i++){
							friendSchedule[d[i].friend._id] = d[i].schedule;
							d[i].friend.color = '#'+(function(h){return new Array(7-h.length).join("0")+h})((rnd(parseInt(d[i].friend._id.substr(15),16))*0x1000000<<0).toString(16))
							$list.append(tmpl($('#template-friend-list').html(), {friend: d[i].friend, schedule: !!d[i].schedule.name}));
						}
						for(i=0; i<len; i++){
							if ( !d[i].schedule.sections ){ continue; }
							for(var j=0,slen=d[i].schedule.sections.length; j<slen; j++){
								if ( typeof sectionFriends[d[i].schedule.sections[j]._id] == 'undefined' ){
									sectionFriends[d[i].schedule.sections[j]._id] = [d[i].friend];
								}else{
									sectionFriends[d[i].schedule.sections[j]._id].push(d[i].friend);
								}
							}
						}
					}
			});
	};

	function showFriendSchedule(listOfSections, scheduleId, color){
		for( var i in listOfSections ){
			var section = listOfSections[i];
			section.color = color;
			addSectionToCalendar(section, scheduleId);
		}
	}

	function hideFriendSchedule(scheduleId){
		$('.option.friend').each(function(){
			if ( $(this).data('scheduleId') == scheduleId ){
				$(this).remove();
			}
		});
	}

	window.initFriends = initFriends;
})(window,document);
