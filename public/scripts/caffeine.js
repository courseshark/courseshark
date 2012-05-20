/**************************************************************
 *
 *   Caffeine Code
 *  
 *  All the methods specific to the caffine management page
 * 
 **************************************************************/

function save_caffeine()
{
	var id = $('#caffeine-id').html();
	var data = $("form#caffeine-update-info").serialize();
	$.ajax({
		url:'/watcher/'+id+'/update',
		async:false,
		dataType:'json',
		type:'POST',
		data:data,
		success: function (data){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/save']);			
			
				if ( data == true )
				{					
					show_timed_message('Saved');
				}
				else
				{
					show_timed_error('Not saved: Please Try Again');
				}
			},
		error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,'',errorThrown);}
		
	});
	return false;
}

function create_new(form)
{	
	form_data = $(form).serialize();
	console.log(form_data);
	$.ajax({
		url:"/watcher/create",
		async:false,
		cache:false,
		type:'POST',
		data:form_data,
		dataType:'json',
		success: function(response){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/create']);
			
		    $('#submit-button').attr('disabled',false).html('<i class="icon-shopping-cart icon-white"></i>Create');
				if ( response.success == true ){
					messageDialog("Your notification has been created!", function(){window.location.reload()});
				}else if ( response.success == false ){
					$('.new-notification-step.showing button:last-child').removeAttr('disabled').html('Create').prev().fadeIn();
					if ( response.message == 'duplicate'){
						messageDialog('You are already watching this class');
					}else if ( response.message == 'contact' ){
						messageDialog('Please enter valid contact information.');
					}else if ( response.message == 'section' ){
						messageDialog('The specified section was not found. Please check it and try again. If the problem persists, please let us know so we can fix it.');
					}else if ( response.message == 'credits' ){
						purchase('form-notification');
					}
				}else{
					errorDialog("<strong>An unexpected error has occurred</strong>.<br /><br />Please check your information and try again.<br /><br />If the problem persists, please <a href='/about/contact' target='_blank'>contact us</a> or file a <a target='_blank' href='http://bugs.courseshark.com/'>bug report</a>.");
				}
			},
		error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,'',errorThrown);}
		});	
}


function update_notification(container, form, id){
	form_data = $(form).serialize();
	$.ajax({
		url:"/watcher/"+id+"/update",
		async:false,
		cache:false,
		type:'POST',
		data:form_data,
		dataType:'JSON',
		success: function(response){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/update']);
			
			if ( response.success == true ){
				$(container).slideUp('normal',function(){
					$(form).children('input').css({'border':''});
					$('.notification-item#item-'+id).fadeOut(200, function(){
						$('.notification-item#item-'+id).fadeIn(200)
					});
				});
			}else if ( response.message == 'contact' ){
				$(form).children('input').css({'border':'1px solid red'});
			}
		},
		error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,'',errorThrown);}			
	});
}

function cancel_notification(id, active){
	
	if(active)
		callback = function(){show_succuess_dialog(id);}
	else
		callback = function(){window.location.reload();};

	$.ajax({
		url: '/watcher/'+id+'/cancel',
		async:false,
		type:'POST',
		dataType:'json',
		success: function(response){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/cancel']);
			
			if ( response.success == true ) {
				messageDialog('Notification Canceled', callback);
			}else{
				errorDialog(response.message);
			}
		}});
}

function delete_notification(id){
	$.ajax({
		url: '/watcher/'+id+'/delete',
		async:false,
		type:'POST',
		dataType:'json',
		success: function(response){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/delete']);
			
			if ( response.success == true ) {
			  $('#item-'+id).fadeOut()
				messageDialog('Notification <strong>Deleted</strong>');
			}else{
				errorDialog(response.message);
			}
		}});
}

function activate_notification(id){
	$.ajax({
		url: '/watcher/'+id+'/activate',
		async:false,
		type:'POST',
		dataType:'json',
		success: function(response){
			
			   //Track page view
			_gaq = _gaq || {};
			_gaq.push(['_trackPageview', '/watcher/activate']);
			
			if ( response.success == true ) {
				messageDialog('Notification Activated', function(){window.location.reload()});
			}else{
				errorDialog(response.message);
			}
		}});
}

