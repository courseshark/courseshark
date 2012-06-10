<!DOCTYPE html> 
<html lang="en"> 
<head>
	<meta charset=utf-8 /> 
	<meta http-equiv="X-UA-Compatible" content="chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1"/>
	<meta name="description" content="College Course Schedule Creator. Helps you create the perfect class schedule quicly and easily.">
	<meta name="keywords" content="College, Schedule, Course, Catalog, Sections, Easy, Registration, Register, Quick, Easy, Calendar">
	<title><?php echo SITE_NAME?></title> 
	
	<?php Router::factoryRequest('/header/css');?>
	<?php Router::factoryRequest('/header/analytics');?>

</head>
<body>
		<div id="message-area">
			<div id="timed-message"></div>	
		</div>
				
		<?php Router::factoryRequest('/header/account'); ?>
		
		<div class="container">
			<div class="row">
				<div class="span6 offset3 well">
					<h1>Single Seat Notification</h1>
					<p>Receive a notification when a seat opens in a full class. Optionally recieve a notification when a spot opens on the class's waiting list.</p>
					<div class="row">
						<div class="span4">
							<h3>$<?php echo SINGLE_NOTIFICATION_PRICE?><small>/course</small></h3>
						</div>
						<div class="span2">
							<button class="btn btn-success btn-large right" onclick="purchase('credit');">Get One!</button>
						</div>
					</div>
				</div>
			</div><!-- /.row -->
		</div>
		
		<div class="container" id="create-notification-form">
			<div class="row">
				<!-- Create form -->
				<div class="span12">
					<form action="/caffeine/create" method="post" name="new-notification" id="new-notification-form">
						<div class="row">
							<fieldset class="span4">
								<legend>Step 1 <small>Select A Course</small></legend>
							    <div class="control-group">
						      <label class="control-label" for="term_id">Term</label>
						      <div class="controls">
										<select name="term_id" id="term_id" autocomplete="on" onchange="$('#major_id').change();" required/>
											<?php foreach($terms as $term):?>
												<option value="<?php echo $term->id?>" title="<?php echo @$term->season.' '.@$term->year?>"><?php echo @$term->season.' '.@$term->year?></option>
											<?php endforeach;?>
										</select>
						      </div>
						      <label class="control-label" for="major_id">Major</label>
						      <div class="controls">
										<select name="major_id" id="major_id" autocomplete="off"/>
											<option value=""></option>
											<?php foreach($majors as $major):?>
												<option value="<?php echo $major->id?>" title="<?php echo $major->name?>"><?php echo $major->abbr?> &mdash; <?php echo $major->name?></option>
											<?php endforeach;?>
										</select>
						      </div>
						      <label class="control-label" for="course_id">Course</label>
						      <div class="controls">
										<select name="course_id" id="course_id" autocomplete="off" />
											<option value=""></option>
										</select>
						      </div>
									<label class="control-label" for="section_id">Section</label>
						      <div class="controls">
										<select name="section_id" id="section_id" autocomplete="off" />
											<option value=""></option>
										</select>
						      </div>
									<div class="v-divide"><span>OR</span></div>
									<div class="right-col">					
										<label for="manual_section_id">Course Registration Number</label>
										<input type="text" name="manual_section_id" placeholder="CRN or Course ID" value="<?php echo $crn?>"/>
									</div>
						    </div>
							</fieldset>
							
							<fieldset class="span4">
								<legend>Step 2 <small>Notification Methods</small></legend>
								<div class="control-group">
						      <label class="control-label" for="email">Email <span class="label">optional</span></label>
						      <div class="controls">
										<input type="email" name="email" placeholder="you@domain.com" value="<?php echo htmlspecialchars($user->email);?>"/>
									</div>
								</div>
								<div class="control-group">
						      <label class="control-label" for="phone">SMS Number <span class="label">optional</span></label>
						      <div class="controls">
										<input type="tel" name="phone" placeholder="Cell Phone Number"/>
									</div>
								</div>
								<div class="control-group">
						      <label class="control-label" for="carrier">Phone Carrier <span class="label">optional</span></label>
						      <div class="controls">
										<select name="carrier" id="carrier">
											<?php foreach ( $cell_carriers as $carrier ){?>
											<option value="<?php echo $carrier->id?>"><?php echo $carrier->name?></option>
											<?php } ?>
										</select>
									</div>
								</div>
							</fieldset>
							
							<fieldset class="span4">
								<legend>Step 3 <small>Settings</small></legend>
								<div class="control-group">
						      <label class="control-label" for="notification-on">Notified when</label>
						      <div class="controls">
										<label class="checkbox">
											<input type="checkbox" name="notification-on" value="seat" checked disabled>
											Seat opens in class.
										</label>
										<!-- <label class="checkbox">
											<input type="checkbox" name="notification-on" value="waitlist">
											Spot opens on waiting list.
										</label> -->
									</div>
								</div>
								<div class="form-actions">
									<button type="button" class="btn btn-large btn-primary" id="submit-button" onClick="$(this).attr('disabled','true').html('Saving..');create_new($('form#new-notification-form'));">
										<i class="icon-shopping-cart icon-white"></i>
										Create
									</button>
								</div>
							</fieldset>
						</div>
					</form>
				</div>
			</div> <!-- /.row -->
		</div>
		
		<div class="container">
			<div class="page-header">
				<h1>Your Notifications</h1>
			</div>
			
			<div class="row">
				<div class="span8 offset2">
					<?php if ( count($notifications) == 0 ): ?>
					<div id="empty-list">
						<h1>You have no Notifications</h1>
						<h2>Create a <a href="javascript:$('#new-notification').slideDown();" title="Create new Notification">new notification</a> to being watching a class for seats</h2>
					</div>
					<?php else: ?>
						<?php foreach( $notifications as $notification ): if ($notification->hidden) continue; ?>
						<div class="notification row <?php echo ($notification->deleted==1?'canceled':($notification->section->available_seats>0?'open':''));?>" id="item-<?php echo $notification->id?>">
							<div class="row">
								
								<div class="span4">
									<h1>
										<?php echo $notification->section->course->major->abbr?> <?php echo $notification->section->course->number?> <?php echo $notification->section->info?>
									</h1>
								</div>
							
								<div class="span2">
									<h3>
									<?php if( $notification->deleted ):	?>
										Canceled
									<?php elseif( $notification->section->available_seats>0 ):?>
										<?php echo $notification->section->available_seats?> Seats Available
									<?php else:?>
										Checking
									<?php endif;?>
									</h3>
								</div>
								<div class="span2">
									<div class="btn-group">
										<a class="btn btn-primary" onClick="$('#edit-<?php echo $notification->id?>').slideToggle()">
											<i class="icon-pencil icon-white"></i> Edit
										</a>
										<a class="btn btn-primary dropdown-toggle" data-toggle="dropdown" href="#" onClick="$('.notification-item-edit#edit-<?php echo $notification->id ?>').slideToggle('fast');return false;"><span class="caret"></span></a>
										<ul class="dropdown-menu">
											
											<?php $cancelAction = (($notification->deleted!=1)?"confirmDialog('Do you want to Cancel this notification?','cancel_notification(".$notification->id.', '.(($notification->section->available_seats>0)?'true':'false').")','dialog_close()','No','Yes');":'activate_notification('.$notification->id.')')."return false;";?>
											<?php $deleteAction = "confirmDialog('Do you want to Delete this notification?','delete_notification(".$notification->id.")', 'dialog_close()','No','Yes');return false;";?>
											<li><a onClick="<?php echo $cancelAction?>" ><i class="icon-ban-circle"></i> Cancel</a></li>
											<li><a onClick="<?php echo $deleteAction?>"><i class="icon-trash"></i> Delete</a></li>
										</ul>
									</div>
								</div>
							</div> <!-- /.row -->
							<div class="row">
								<div class="span4">
									<p>
										<?php echo $notification->section->getTimeString(false);?>
									</p>
									<p><?php echo $notification->profLocation()?></p>
								</div>
								<div class="span4">
									<h4>
									<?php if ( $notification->deleted ): ?>
										<a href="javascript:activate_notification(<?php echo $notification->id?>);" title="Restore to Active status">Click to reactivate<a>
									<?php else: ?>
										Last Update: <?php echo Formatter::timeAgo($notification->section->modified);?> 
									<?php endif; ?>
									</h4>
								</div>
							</div>
							<div class="well notification-edit" id="edit-<?php echo $notification->id?>">
								<form class="form-inline" id="edit-form-<?php echo $notification->id?>">
										<label for="email">Email</label>
										<input type="email" name="email" class="span2" value="<?php echo $notification->email?>" />
										<label for="phone">Phone</label>
										<input type="tel" name="phone" class="span2" value="<?php echo Formatter::formatPhone(preg_replace('/[^0-9]*/','',$notification->sms_email))?>" />
										<label for="carrier">Carrier</label>
										<select name="carrier" class="span2">
											<?php foreach ( $cell_carriers as $carrier ):?>
											<option value="<?php echo $carrier->id?>" <?php echo $carrier->id==$notification->carrier?'selected':''?>><?php echo $carrier->name?></option>
											<?php endforeach; ?>
										</select>
										<button type="button" class="btn btn-primary" onclick="update_notification($('#edit-<?php echo $notification->id?>'), $('#edit-form-<?php echo $notification->id?>'), <?php echo $notification->id?>);">Save</button>
								</form>
							</div>
						</div><!-- /.notification -->
					<?php  endforeach; ?>
				<?php endif; ?>
				</div>
			</div> <!-- /.row -->

		</div>
				
					
				<!-- List of caffeines -->
				
				
				
				

						
				<!-- End of list -->
				
			</section>
		
		</article>

		
		<?php Router::factoryRequest('/footer/'); ?>
		
	</section>
	

	
	
	
	
	
	
	<!-- ONLY SCRIPTS BELOW HERE -->
	<?php Router::factoryRequest('/header/js');?>
	
	
	<script type="text/javascript">
		google.load('payments', '1.0', {
		  'packages': [<?php echo (MODE=='DEVELOPMENT'?'\'sandbox_config\'':'\'production_config\'')?>]
		});

		function showCreateNotification(){
			$('#new-notification').slideToggle('slow');
		}

		//Success handlers
		var purchaseThisSuccessHandler = function(purchaseAction){

			purchaseAction.response = purchaseAction.response?purchaseAction.response:{orderId:''};
			_gaq.push(['_trackEvent', 'PurchaseNotification', 'Success', 'FromForm']);

			$.ajax({
			  	url: '/transactions/confirm',
			  	data: {'orderId': purchaseAction.response.orderId},
					method: 'POST',
			  	success: function(j) {
					if ( j.success )
						create_new($('form#new-notification-form'));
					else
						errorDialog('We cannot validate your purchase. Please contact us at <a href="mailto:support@courseshark.com">support@courseshark.com</a> to remedy this issue.');
				},
			  	dataType: 'json'
			});
		}
		var purchaseSuccessHandler = function(purchaseAction){
			
			purchaseAction.response = purchaseAction.response?purchaseAction.response:{orderId:''};
			
			_gaq.push(['_trackEvent', 'PurchaseNotification', 'Success', 'Credit']);
			
			$.ajax({
			  	url: '/transactions/confirm',
			  	data: {'orderId': purchaseAction.response.orderId},
				method: 'POST',
			  	success: function(j) {
					if ( j.success ){
						$('#number-of-credits').fadeOut(function(){
							$(this) .html(''+(parseInt($('#number-of-credits').html())+1))
									.fadeIn();
						});
						showCreateNotification('single');
					}else{
						errorDialog('We cannot validate your purchase. Please contact us at <a href="mailto:support@courseshark.com">support@courseshark.com</a> to remedy this issue.');
					}
				},
			  	dataType: 'json'
			});
		}	

		//Failure handler
		var purchaseThisFailureHandler = function(purchaseActionError){
			_gaq.push(['_trackEvent', 'PurchaseNotification', 'Abandon', 'FromForm']);
		   	if (window.console != undefined) {
		    	console.log("Purchase did not complete.", purchaseActionError);
		  	}
		}
		var purchaseFailureHandler = function(purchaseActionError){
			_gaq.push(['_trackEvent', 'PurchaseNotification', 'Abandon', 'Credit']);
		   	if (window.console != undefined) {
		    	console.log("Purchase did not complete.", purchaseActionError);
		  	}
		}


		function purchase(what){
			generatedJwt = "<?php echo $singleToken; ?>";
			if ( what == 'form-notification' ){
				_gaq.push(['_trackEvent', 'PurchaseNotification', 'Start', 'FromForm']);
				goog.payments.inapp.buy({
					'jwt'     : generatedJwt,
					'success' : purchaseThisSuccessHandler,
					'failure' : purchaseThisFailureHandler
				});
			}else{
				_gaq.push(['_trackEvent', 'PurchaseNotification', 'Start', 'Credit']);
				goog.payments.inapp.buy({
					'jwt'     : generatedJwt,
					'success' : purchaseSuccessHandler,
					'failure' : purchaseFailureHandler
				});
			}
			return;
		}



		$('#major_id').change(function(){
			if ( $('#major_id option:first-child').val() == "" ){
				$('#major_id option:first-child').remove();
			}
		
			$("#course_id").attr('disabled','true').html("<option value=null>Loading...</option>");
			$("#section_id").attr('disabled','true').html("<option value=null>Loading...</option>");
		
			add_callback = function(j){			
		      	var options = '';
		      	for (var i = 0; i < j.length; i++) {
		        	options += '<option value="' + j[i]._data.id + '" title="' + j[i]._data.name + '">' + j[i]._data.number + ' &mdash; ' + j[i]._data.name + '</option>';
		      	}
			
		      	$("#course_id").html(options)
			  				.removeAttr('disabled')
							.change();
			};

			get_courses_from_major($(this).val(), add_callback, $('#term_id').val());

		});
		$("#course_id").change(function(){
			$('#selected-course-name').fadeOut('fast',function(){$(this).html($("#course_id option:selected").attr('title')).fadeIn('fast')});
			if ( $('#course_id option:first-child').val() == "" ){
				$('#course_id option:first-child').remove();
			}
			$("#section_id").attr('disabled','true');

			add_callback =  function(j){		
				if ( j.length == 1 && j[0].id==null){
					$('#section_id').html("<option value=null>No Full Sections</option>");
					return;
				}else{
					var options = '';
					for (var i = 0; i < j.length; i++) {
						options += '<option value="' + j[i].id + '" title="' + j[i].timeslot_string + '">' + j[i].timeslot_string + ' &mdash; ' + j[i].number + ' '+((j[i].type != 'None' && j[i].type != "")?'('+j[i].type+')':'')+'</option>';
					}
					$("select#section_id").html(options).removeAttr('disabled');
					$("#section_id").change();
				}
			}
			$('#section_id').html("<option value=null>Loading...</option>");
			get_full_sections_from_course($(this).val(), $('#term_id').val(), add_callback);

		});
		$("#section_id").change(function(){
			$('#selected-section-info').fadeOut('fast',function(){$(this).html($("#section_id option:selected").attr('title')).fadeIn('fast')});
			if ( $('#section_id option:first-child').val() == "" ){
				$('#section_id option:first-child').remove();
			}
		});
		<?php if ( $here_to_create ) {?>
			$('.new-notification-step.showing > button.next').css({'box-shadow':'0 0 5px #0f0'});
			$('.new-notification-step.showing > h1').css({'text-shadow':'0 0 4px #0f0'});
		<?php } ?>
	
		<?php 
		if ( @$delete_success ){
		?>
		show_succuess_dialog(<?php echo $deleted_id?>);
		<?php 
		}
		?>
		<?php 
		if ( @$delete_failure ){
		?>
		errorDialog('It seems this notification was <strong>already deleted</strong>? If not, try again in a few minutes.');
		<?php 
		}
		?>
		<?php 
		if ( @$temp_login ){
		?>
		$(window).bind('beforeunload', function(){
		       $.ajax({cache: false,
		        		async:false,
		            	url: "/users/logout",
						success:function(){
						}
		        });
		    });
		<?php 
		}
		?>
		function showSchoolDialog() {
			openDialog('/account/set-school').on('hidden', function(){setTimeout(showSchoolDialog, 1000)});
		}
		if ( window.school === 0 ){
			showSchoolDialog();
		}
	</script>
	
</body>
</html>