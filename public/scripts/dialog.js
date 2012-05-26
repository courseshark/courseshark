/******************************************
 * Dialog.js
 *
 * Contains all the dialog methods to open
 * close, and initiate dialogs on the pages
 *
 * (c) James Rundquist 2011
 *****************************************/

/******************************************
 * Open/Close functions
 *****************************************/
 function initElements(){
	$('<div id="dialog-overlay"></div><div id="dialog-wrapper"><div id="dialog-container"><div id="dialog-header"><div id="close-button">x</div></div><section id="dialog-content"></section></div></div>').appendTo('body').hide();

}
function initFooter(){
	$('#dialog-wrapper #dialog-container').append('<div id="dialog-footer"><button id="dialog-close">close</button></div>');
}

/***
* Functions to handle default events
*/
$(document).delegate("#close-button, #dialog-wrapper, #dialog-close","click",function(event){
	var options = {'close-button':'', 'dialog-wrapper':'', 'dialog-close':''};
	// If one of the elements we are looking for has been clicked, close the dialog
	// This check prevents against children from triggering the close
	if ( event.target.id in options )
		closeDialog();
});



/***
* Callable functions
*/
function showOverlay(){
	$('#dialog-wrapper').hide();
	$('#dialog-overlay').fadeIn();
	$('body').css({'-webkit-filter':'grayscale(0.5) blur(10px);'});
}
function hideOverlay(){
	$('#dialog-wrapper').hide();
	$('#dialog-overlay').fadeOut();
}

function openDialog(url, name, specialClass, next){
	// Load either the template, or the URL passed
	if ( $('script[type="text/template"]#_'+url).length !== 0 ){	// If we were passed an id of a template
		content = $('script[type="text/template"]#_'+url).html();
	}else{
		content = "[ Error loading content ]";
		$.ajax({url:url, success:function(h){content=h;_gaq=_gaq||{};_gaq.push(['_trackPageview',url]);}, async:false});
	}

	$existing = $('.modal[data-url="'+url+'"]');
	if ( $existing.length !== 0 ){
		$existing.html(content).modal('show');
	}else{
		$existing = $('<div class="modal fade" data-url="'+url+'">').appendTo('body').html(content).modal('show');
	}
	return $existing;
}
function closeDialog(){
	hideOverlay();
	$('#dialog-container').removeAttr('class');

}
function dialog_close(){
	closeDialog();
}


/******************************************
 * Login and registration dialogs
 *****************************************/

function show_timed_message(message){
	$('#timed-message').html(message);
	$('#timed-message').slideDown(400);
	setTimeout('$(\'#timed-message\').slideUp(500, function(){$(this).removeClass(\'warning\').removeClass(\'error\')});',5000);
}
function show_timed_warning(message){
	$('#timed-message').addClass('warning');
	show_timed_message(message);
}
function show_timed_error(message){
	$('#timed-message').addClass('error');
	show_timed_message(message);
}
function show_schedule_conflict(messgae){
	$('#conflict-message').fadeIn(350);
	$('#conflict-message').html(messgae);
}
function hide_schedule_conflict(){
	$('#conflict-message').fadeOut(350);
}
/******************************************
 * Utility dialogs
 *****************************************/

function loading_dialog(){
	dialog_open(true);
}

function errorDialog(html, info, callback){
	info = '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>Message</h3></div>\
					<div class="modal-body"><h4>'+html+'</h4><div class="well">'+info+'</div></div>\
					<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal">Alright</a></div>';

	id = 'error_'+Math.floor(Math.random()*1000);
	$('body').append('<script type="text/template" id="_'+id+'">'+info+'</script>');
	modal = openDialog(id, 'errorDialog');
	if ( callback ){
		modal.on('hidden', callback);
	}
	return modal;
}

function messageDialog(html, callback){
	info = '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>Message</h3></div>\
					<div class="modal-body"><h4>'+html+'</h4></div>\
					<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal">Alright</a></div>';

	id = 'message_'+Math.floor(Math.random()*1000);
	$('body').append('<script type="text/template" id="_'+id+'">'+info+'</script>');
	modal = openDialog(id, 'messageDialog')
	if ( callback ){
		modal.on('hidden', callback);
	}
	return modal;
}

function confirmDialog(text, success, fail, button_cancel, button_ok){
	if ( !button_cancel )
		button_cancel = "Cancel";
	if ( !button_ok )
		button_ok = "Continue";

	info = '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>Confirm</h3></div>\
					<div class="modal-body"><h4>'+text+'</h4></div>\
					<div class="modal-footer">\
						<a href="#" class="btn btn-primary" onClick="'+success+'" data-dismiss="modal">'+button_ok+'</a>\
						<a href="#" class="btn" onClick="'+fail+'" data-dismiss="modal">'+button_cancel+'</a>\
					</div>';

	id = 'confirm_'+Math.floor(Math.random()*1000);
	$('body').append('<script type="text/template" id="_'+id+'">'+info+'</script>');
	openDialog(id, 'confirm_dialog');
}

/******************************************
 * Login and registration dialogs
 *****************************************/
function show_login_dialog(){
	openDialog("/users/login/dialog", "login");
}

function show_register_dialog(){
	show_login_dialog();
//	openDialog("/users/login/dialog", "register");
}

function showScheduleConflict(messgae){
	$('#conflict-message').fadeIn(350);
	$('#conflict-message').html(messgae);
}
function hideScheduleConflict(){
	$('#conflict-message').fadeOut(350);
}

/******************************************
 * Schedule dialogs
 *****************************************/

function show_number_dialog(schedule){
	openDialog("/schedule/dialog/numbers");
}


function show_load_dialog(){
	openDialog('/schedule/dialog/load');
}

function show_new_dialog(){
	openDialog('/schedule/dialog/new');
}

function show_save_dialog(){
	openDialog('/schedule/dialog/save');
}

function check_for_safe_name_and_save(string, primary){
	if ( string.length === 0 ){
		$('#name-input').addClass('error');
		$('#name-input').css({'background-position':'99% 50%'});
		$('#name-input-message').html('You must enter a name');
		return false;
	}
	else
	{
		$('#name-input').removeClass('error');
		$('#name-input-message').html('');
		save_schedule(string, primary);
		dialog_close();
	}

}

function check_for_duplicate_name(string){

	var value = false;

	$('#name-input').removeClass('error');

	$.ajax({
		url:"/schedule/name-exists",
		data:{'name':string},
		async:true,
		type:'POST',
		dataType:'json',
		success: function(return_value){
			value = return_value;
			if ( false === value ){
				$('#name-input').css({'background-position':'-9999px -9999px'});
				$('#name-input').attr('title', 'Schedule Name');
				$('#name-input-message').html('');
			}
			else
			{
				$('#name-input').css({'background-position':'99% 50%'});
				$('#name-input').attr('title', 'You already have a schedule called "'+string+'". It will be overwritten.');
				$('#name-input-message').html('You already have a schedule called "'+string+'". It will be overwritten.');

			}
		},
		error: function(q, w, e){alert(e);}
	});


	return value;
}

/** caffeine functions **/

function show_caffeine_dialog(section_id){
	window.location = "/watcher/new/"+section_id;
}


/** AutoPilot dialog **/

function show_autopilot_dialog(){
	openDialog("/auto-pilot/dialog/start");
}

function auto_pilot_aditional_course($input_box){
	var values = '';
	var count = 0;
	$inputs = $input_box.children('.ap-course');
		$inputs.each(function() {
				values = ''+values+'&course'+count+'='+$(this).val();
		count++;
		});

	//Make call to create
	$.ajax({
		url:"/auto-pilot/create",
		data:values,
		async:false,
		type:'GET',
		dataType:'json',
		success: function(auto_pilot){
				if ( auto_pilot.error !== '' ){
					errorDialog("There is no possible schedule with the classes you have selected. One or more courses are conflicting. Try picking different courses.");
				}else{
					if ( Modernizr.localstorage ){
						localStorage.clear("courseshark.schedule.current");
					}

					if ( auto_pilot.has_full_class ) {
						_gaq = _gaq || {};
						_gaq.push(['_trackEvent', 'AutoPilot', 'Complete', 'Conflicts']);
						messageDialog("Your schedule has full classes, but don't freat! You may still get a seat using Caffeine!<br /><ol><li>Select the course that is full</li><li>Click on Caffeine Link</li><li>Tell us how you want to be contacted.</li><li>Get the class!</li></ol>");
						reset_all();
						show_session_schedule();
					}
					else
					{
						_gaq = _gaq || {};
						_gaq.push(['_trackEvent', 'AutoPilot', 'Complete', 'No Conflicts']);
						messageDialog('Check out your new schedule!');
						reset_all();
						show_session_schedule();
					}
				}
			}
		});
}

//
/** Caffeine Page Specific **/
//

function show_succuess_dialog(id)
{
	openDialog("/watcher/dialog/success/"+id);
}
function submit_success_form(id, data)
{
	$.ajax({
		url:"/watcher/dialog/success/"+id,
		async:true,
		type:'POST',
		data:data,
		dataType:'text',
		success: function(dialog_content){
				messageDialog(dialog_content);
			}
		});
}




/******************************************
 * Login and registration dialogs
 *****************************************/
function add_friends_dialog(){
	openDialog("/social/friends/dialog").friendsSearch({next:addUsers});
}


