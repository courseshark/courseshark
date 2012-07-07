//fallback on console log
if ( !window['console'] ){
	window.console = {};
	window.console.info = function(){};
	window.console.log = function(){};
	window.console.warn = function(){};
	window.console.error = function(){};
}

// Setup ajax
$.ajaxSetup({
	timeout: 60000 ///60 second timeout
});


function errorHandler(err, text, errInfo)
{
	if (text === ''){
		text = '<strong>An unexpected error has occurred</strong>.<br /><br />Please check your information and try again.<br /><br />If the problem persists, please <a href="/about/contact" target="_blank">contact us</a> or file a <a target="_blank" href="http://bugs.courseshark.com/">bug report</a>."';
	}
	errorDialog(text, errInfo);
}

function redirect(url){
	window.location = url;
}

function noscript(){
	$('noscript').each(function(){$(this).remove();});
}

function logout(){
	var removed = window.localStorage ? window.localStorage.removeItem ? window.localStorage.removeItem("primary-schedule") : 0 : 0;
	window.location = '/users/logout';
}

function get_courses_from_major(id, callback, term){
	$.ajax({
			url:"/term/"+term+"/courses/"+id,
			success: function(c){callback(c);},
			dataType:'json',
			data:{},
			error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,'',errorThrown);}
		});
}

function get_full_sections_from_course(id, term_id, callback){
	$.ajax({
			url:"/school/"+school+"/course/"+id+"/term/"+term_id+"/full" ,
			success: callback,
			dataType:'json',
			data:{},
			error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,'',errorThrown);}
		});
}

try{
	$.ajaxSetup({timeout:15000});
}catch(err){}

// $(document).mousemove(function(e){
// 	document.x = e.pageX;
// 	document.y = e.pageY;
// });

SectionPicker = function(opts){

	var $term, $major, $course, $section, options, term, updating;
	$term = this.$term = opts['term']
	$department = this.$department = opts['department']
	$course = this.$course = opts['course']?opts['course']:$('<select>')
	$section = this.$section = opts['section']?opts['section']:$('<select>')
	config = this.config = opts['options']
	updating = {}

	term = $term?$term.val():window.term?window.term.id?window.term.id:window.term:'';

	$.ajax({
			url: '/school/departments'
		, dataType: 'json'
		, success: function(d){
				var options = '', e = {}
				for ( var i=0,len=d.length; i<len; i++ ){
					e = d[i]
					options += '<option value="'+e._id+'">'+e.name+'</option>'
				}
				$department.html(options).removeAttr('disabled').change()
			}
	})

	$department.change(function(){
		var id = $department.val()
		if ( $department.children('option').first().val() === '' ){
			$department.children('option').first().remove();
		}
		if (!id){return;}
		$course.attr('disabled','true').html("<option>Loading...</option>");
		$section.attr('disabled','true').html("<option value=''>Loading...</option>");
		$.ajax({
				url:"/term/"+term+"/courses/"+id
			, dataType:'json'
			, success: function(c){
					var options = '';
					for (var i = 0; i < c.length; i++) {
						options += '<option value="'+c[i]._id+'">'+c[i].number+' &mdash; '+c[i].name+'</option>'
					}
					$course.html(options).removeAttr('disabled').change()
				}
			, error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,textStatus,errorThrown);}
		});
	});

	$course.bind('change',function(){
		var id = $course.val()
		$section.attr('disabled','true').html("<option value=''>Loading....</option>");
		if (!id){return;}
		$.ajax({
				url:"/term/"+term+"/sections/"+id
			, dataType:'json'
			, success: function(secs){
					updating[id] = 0
					var options = '', s = {}
					for ( var i=0,len=secs.length; i<len; i++ ){
						s = secs[i]
						if ( !config['empty'] ){
							options += '<option value="'+s._id+'">'+s.number+' &mdash; '+s.timeslots[0].instructor+'</option>'
						}else{
							updating[id]++
							seats.emit('update', s._id)
						}
					}
					if ( !config['empty'] ){
						$section.html(options).removeAttr('disabled')
					}
				}
			, error: function(jqXHR, textStatus, errorThrown){errorHandler(jqXHR,textStatus,errorThrown);}
		});
	})
	if ( config['empty'] ){
		seats.on('result', function(section){
			s = section.section
			if ( section.avail <= 0 ){
				$section.append('<option value="'+s._id+'">'+s.number+' &mdash; '+s.timeslots[0].instructor+'</option>')
			}
			if ( --updating[s.course] === 0 ){
				$section.children("option[value='']").remove();
				if ( $section.children('option').length === 0 ){
					$section.html('<option value="">No Full Sections</option>')
				}else{
					$section.removeAttr('disabled')
				}
			}
			
		});
	}
	return this
}

function validateEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return email.match(re);
}
