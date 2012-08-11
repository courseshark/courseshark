$('.friend-available:not(.none)').live('click', function(){
  $this = $(this);
	scheduleId = $this.toggleClass('showing').data('schedule');
	color = $this.data('color');
  makeFriendScheduleCall($this, scheduleId, color);
});
$('.friend-schedule').live('click', function(){
	$this = $(this);
	scheduleId = $this.toggleClass('showing').data('schedule');
  makeFriendScheduleCall($this, scheduleId);
});



(function(window, document, undefined){
	
	initFriends = function(){
		$.ajax({
					url: '/friends.json'
				,	dataType: 'json'
				,	success: function(d){
						console.log(d);
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
