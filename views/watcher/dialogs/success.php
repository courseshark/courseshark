<div id="caffeine-dialog">
	
	<header>
		<h1>Did you get your class?</h1>
	</header>
		
	<article>
		
		<h1>Was your notification successful? </h1>
		<p>Let us know if you got into your class or just don't want notifications any more. </p>
		<h2 class="question">Success?</h2>
		<form id="success_form" name="success_form" action="#" method='post'>
			<input type="hidden" value="<?php echo $id?>" name="caffeine_notification_id" />
			<div class="center">
				<input type="radio" name="success" value="1" id="success1" checked /><label for="success1">Yes</label>
				<input type="radio" name="success" value="0" id="success0"/><label for="success0">No</label>
			</div>
			
			
			<h2 class="question">Anything you want to add?</h2>
			
			<div class="center">
				<textarea name="story"></textarea>
			</div>
			
		</form>
	</article>
	
	<div id="dialog-footer">
		<button type="button" class="dialog-button" id="load" value="Cancel" onClick="dialog_close();">Cancel</button>
		<button type="button" class="dialog-button" id="save" value="Submit" onClick="submit_success_form(<?php echo $id?>, $('#success_form').serialize());">Submit</button>
	</div>
</div>