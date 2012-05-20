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

function makeFriendScheduleCall($that, scheduleId, color){
  if ( $that.hasClass('showing') ){
		if ( sch = $that.data('scheduleObject'), sch ){
			showFriendSchedule(sch.schedule, sch.id, sch.color);
		}else{ 
			$.ajax({	
					url: '/social/schedule/'+scheduleId,
	    		dataType:'json',
	    		success: function(res){
	    		  if ( res.success ){
							$that.data('scheduleObject', {schedule: res.message, id: scheduleId, color: color});
	    			  showFriendSchedule(res.message, scheduleId, color);
	    			}
					}
			});
		}
	}else{
		hideFriendSchedule(scheduleId);
	}
}

function showFriendSchedule(listOfSections, scheduleId, color){
  for( i in listOfSections ){
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