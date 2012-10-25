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

Notifications.prototype.add = function(note){
	this.notifications.push(note);
	this.$list.empty();
	this.show();
}

Notifications.prototype.load = function(){
	self = this
	$.ajax({
			url: '/notifications.json'
		,	async: false
		,	dataType: 'json'
		, success: function(notifications){
				self.notifications = notifications;
				self.show();
			}
	})
	return this;
}
Notifications.prototype.show = function(){
	for (var i=0,len=this.notifications.length; i<len; i++){
		note = this.notifications[i];
		if ( this.$list.find('[rel="notification"][data-id="'+note._id+'"]').length <= 0 ){
			note = $(tmpl(this.template,{notification: note})).appendTo(this.$list).data('notification', note)
		}
	}
	$('[rel="notification-updated"]').each(function(){
		$this = $(this)
		$this.html(prettyDate($this.data('updated')))
	})
	$('[rel="notification-edit"]').each(function(){
		$(this).click(function(){
			$('[rel="edit-form"][data-notification="'+$(this).data('notification')+'"]').toggle()
		})
	})
	return this;
}
Notifications.prototype.cancel = function(notification){
	for (var i=0,len=this.notifications.length; i<len; i++){
		if ( (note=this.notifications[i])._id == notification._id ){
			this.$list.find('[rel="notification"][data-id="'+note._id+'"]').addClass('canceled')
			$.ajax({
					url: note.cancelLink+'.json'
				,	data: {'_method':'GET'}
				, type: 'GET'
			})
		}
	}
	return this;
}

Notifications.prototype.reactivate = function(notification){
	for (var i=0,len=this.notifications.length; i<len; i++){
		if ( (note=this.notifications[i])._id == notification._id ){
			this.notifications = this.notifications.splice(i, 1)
			this.$list.find('[rel="notification"][data-id="'+note._id+'"]').removeClass('canceled')
			$.ajax({
					url: note.reactivateLink+'.json'
				,	data: {'_method':'GET'}
				, type: 'GET'
			})
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
					url: note.deleteLink+'.json'
				,	data: {'_method':'GET'}
				, type: 'GET'
			})
		}
	}
	return this;
}

Notifications.prototype.edit = function(notification){
	for (var i=0,len=this.notifications.length; i<len; i++){
		if ( (note=this.notifications[i])._id == notification._id ){
			var id = note._id
				,	$form = $('[rel="edit-form"]')
				,	$email = $form.find('input[name="email"]')
				,	$phone = $form.find('input[name="phone"]')
			console.log($form,$email,$phone);
			note.email = $email.val()
			note.phone = $phone.val()
			$.ajax({
				url: '/notifications/'+id+'.json',
				data: {'notification.email':note.email, 'notification.phone':note.phone, '_method':'PUT'},
				type: 'PUT'
			})
			$('[rel="edit-form"][data-notification="'+id+'"]').toggle()

		}
	}
	return this;
}

window.Notifications = Notifications

})(window)