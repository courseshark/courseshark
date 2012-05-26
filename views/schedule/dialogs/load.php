<div class="modal-header">
	<a href="#" class="close" data-dismiss="modal">&times;</a>
	<h3>Load</h3>
</div>

<div class="modal-body">
	<h4>Open a perviously created schedule:</h4>
	<div class="loadNode">
		<div class="name title">Name</div>
		<div class="term title">Term</div>
		<div class="hours title">Hrs</div>
		<div class="modified title">Modified</div>
		<div class="delete title"></div>
	</div>
	<div id="loadList">
		<?php if ( count($schedules) == 0 ):?>
			<div class="loadNode">You have no saved schedules.</div>
		<?php endif; ?>		
		<?php foreach ( $schedules as $schedule ):?>
			<?php
			$term_class = $user->school->getNamespaceFor('Term');
	 		$term = $term_class::find($schedule->term_id);
			$date = new DateTime($schedule->modified);
			?>
	
			<div class="loadNode">
				<a href="#" data-dismiss="modal" <?php echo $schedule->primary==TRUE?' class="name bold"':'class="name"'?> onClick="Schedule.load(<?php echo $schedule->id;?>);"><?php echo $schedule->name?></a>
				<div class="term"><?php echo @$term->season?> <?php echo @$term->year?></div>
				<div class="hours"><?php echo $schedule->creditHours ?></div>
				<div class="modified"><?php echo $date->format('m/d/Y h:i a')?></div>
				<div class="delete" onclick="if(confirm('Delete this schedule?')){if(deleteSchedule(<?php echo $schedule->id;?>)){$(this).parent().fadeOut();}}">&times;</div>
			</div>			
		<?php endforeach; ?>

	</div>
</div>

<div class="modal-footer">
	<a href="#" class="btn btn-primary" data-dismiss="modal">Close</a>
</div>
