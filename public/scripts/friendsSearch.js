($.fn.friendsSearch = function(options){
	
	var opts = $.extend({section: 0}, options),
	$this = $(this).data('section', opts.section),
	list = [],
	$searchList = $this.find('#search-list');
	
	$this.find('#active-search-box').bind('keyup', function(e) {
		if ( e.keyCode === 13 ){
			if ( $searchList.children('.friend').size() === 1 ){
				addToList($($searchList.children('.friend')[0]).data('user'));
			}else if ( validateEmail(this.value) ){
				email = this.value;
				this.value = '';
				this.focus();
				addToList({id:email,first_name:email,last_name:''});
			}
		}else{
			updateList(this);
		}
	});
	
	$this.find('.click-to-remove').live('click', function(e){
		for( var i in list ){
			if ( list[i].id == $(this).parent().data('user').id ){
				list.splice(i,1);
				if ( list.length === 0 )
					$('#personal-message').addClass('hidden');
			}
		}
		$(this).parent().remove();
	});
	
	$this.find('.btn-primary.next').bind('click', function(e){
		opts.next(list, $this);
	});
	
	function addToList(user){
		$list = $this.find('#adding-list'),
		newHtml = window.tmpl($('#template-action-list-friend').html(), {user: user});
		if ( $this.find('#to-add-'+user.id).length === 0 ){
			$(newHtml).attr('id', 'to-add-'+user.id).data('user', user).appendTo($list);
			list.push(user);
			$this.find('#personal-message').removeClass('hidden');
		}
		$searchList.empty();
		$this.find('#active-search-box').val('').focus();
	}
	
	function updateList(input){
		var q = encodeURI($(input).val().trim().replace('.','^'));
		if ( q.length > 2 ){
			searchUsers(q);
		}else if( q.length === 0 ){
			$list = $searchList.empty();
		}
	}

	function searchUsers(q){
		$.ajax({url: '/friends/search/'+q+'.json',
				type: 'GET',
				dataType: 'json',
				success: function(res){
					$searchList.empty();
					if ( $this.find('#active-search-box').val().length < res.query ){
						return;
					}
					for ( var f in res.users ){
						userHtml = window.tmpl($('#template-search-friend-result').html(), {user:res.users[f]});
						$(userHtml).data('user', res.users[f]).appendTo($searchList);
					}
					$this.find('.friend').bind('click', function(e) {
						addToList($(this).data('user'));
					});
				}});
	}
})();



function inviteUsers(list, $this){
	ids = $.map( list, function( value, index ) { return value; });
	$.ajax({url: '/friends/invite-to-class/'+$this.data('section'),
			type: 'POST',
			data: {'ids': ids, 'message':$('#personal-message').val()},
			success: function(res){
				console.log(res);
			}
		});
}


function addUsers(list, $this){
	ids = $.map( list, function( value, index ) { return value; });
	ids.forEach(function(id){
		$.ajax({url: '/friends/'+id, type: 'POST'})
	})
}