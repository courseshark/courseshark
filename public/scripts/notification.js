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