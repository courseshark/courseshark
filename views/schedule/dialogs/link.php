<div class="modal-header">
	<a href="#" class="close" data-dismiss="modal">&times;</a>
	<h3>Schedule Link</h3>
</div>

<div class="modal-body">
	<div id="link" class="well">
		<h2 id="url">
		</h2>
	</div>
	<div class="row-fluid">
		<div class="span2">
			<a href="https://twitter.com/share" id="twitter-link" class="twitter-share-button" data-url="" data-text="Check out my schedule for next semester!" data-via="courseshark" data-count="none" >Tweet</a>
		</div>
		<div class="span2">
			<a name="f-2b" type="button" share_url="YOUR_URL"></a> 
		</div>

		<div class="span2">
			<a name="email" type="button" class="btn btn-small" style="height:18px;font-size:11px;font-weight:bold;padding:0 11px;line-height:15px" onClick="sendEmail()">Email</a> 
		</div>
	</div>
</div>

<div class="modal-footer">
	<a href="#" class="btn btn-primary" data-dismiss="modal">Close</a>
</div>


<script src="https://facebook.com/connect.php/js/FB.Share" type="text/javascript"></script>
<script>
// create the twitter buttons
$url = $('#link #url');
$twitterButton = $('#twitter-link');
showLink = function(res){
	if ( res.url ){
		selectText($url.html(res.url).attr('id'))
		$twitterButton.attr('data-url', res.url)
		$('a[name="f-2b"]').attr('share_url', res.url).attr('name', 'fb_share')
		window.twttr ? window.twttr.widgets.load() : 0
		window.FB ? window.FB.Share ? window.FB.Share.renderAll() : 0 : 0
	}else{
		errorDialog(res.error)
	}
}
sendEmail =  function(){
	window.location = 'mailto:[%20ENTER%20YOUR%20EMAIL%20]?subject=CourseShark%20Schedule&body='+$url.html();
}
selectText = function(element) {
    var doc = document;
    var text = doc.getElementById(element);    

    if (doc.body.createTextRange) { // ms
        var range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();            
        var range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

$.ajax({url:'/schedule/link', type: 'POST', data: {schedule: JSON.stringify(schedule)}, success: showLink})
</script>
