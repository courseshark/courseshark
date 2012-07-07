admin = {}

admin.schools = {
		toggleEnabled: function(schoolID){
			$.ajax({url:'/schools/'+schoolID+'/toggle-enabled'})
		}
	,	toggleNotification: function(schoolID){
			$.ajax({url:'/schools/'+schoolID+'/toggle-notifications'})
		}
}




$('.school-notifications-toggle').click(function(){
	$(this).toggleClass('btn-success').toggleClass('btn-danger').html($(this).html()=='true'?'false':'true');
	id = $(this).parent().parent().data('school')
	admin.schools.toggleNotification(id)
})

$('.school-enabled-toggle').click(function(){
	$(this).toggleClass('btn-success').toggleClass('btn-danger').html($(this).html()=='true'?'false':'true');
	id = $(this).parent().parent().data('school')
	admin.schools.toggleEnabled(id)
})