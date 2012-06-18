(function(window){


function prettyDate(time){
	var diff = ((Date.now() - parseInt(time, 10)) / 1000)
		,	day_diff = Math.floor(diff / 86400);
	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return;
	return day_diff === 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}

var Notifications = function($list, $template){
	this.$list = $list
	this.notifications = []
	this.template = $template!==undefined?$template.html():'<$=notification$>'
	this.load()
	return this;
}
Notifications.prototype.load = function(){
	self = this
	$.ajax({
			url: '/notifications.json'
		,	async: false
		,	dataType: 'json'
		, success: function(notifications){
				self.notifications = notifications;
			}
	})
	return this;
}
Notifications.prototype.show = function(){
	for (var i=0,len=this.notifications.length; i<len; i++){
		note = this.notifications[i];
		if ( this.$list.find('[rel="notification"][data-id="'+note._id+'"]').length <= 0 ){
			$(tmpl(this.template,{notification: note})).appendTo(this.$list).data('notification', note)
		}
	}
	$('[rel="notification-updated"]').each(function(){
		$this = $(this)
		$this.html(prettyDate($this.data('updated')))
	})
	return this;
}
Notifications.prototype.remove = function(notification){
	for (var i=0,len=this.notifications.length; i<len; i++){
		if ( (note=this.notifications[i])._id == notification._id ){
			this.notifications = this.notifications.splice(i, 1)
			this.$list.find('[rel="notification"][data-id="'+note._id+'"]').fadeOut()
			$.ajax({
					url:'/notifications/'+note._id
				,	data: {'_method':'DELETE'}
				, type: 'DELETE'
			})
		}
	}
	return this;
}

window.Notifications = Notifications

})(window)