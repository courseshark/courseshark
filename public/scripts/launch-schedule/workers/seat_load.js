self.onmessage = function (event) {	
	
	d = JSON.parse(event.data);
	id = parseInt(d.id);
	school = parseInt(d.school);
	
	if ( id <= 0 ){
		self.postMessage('{"msg":"Error no id"}');
	}
	
	res = JSON.parse(get("/school/"+school+"/section/"+id+"/seats"));
	res.id = id;
	res.child = d.child;
	
	self.postMessage(JSON.stringify(res));
};


function get(url) {
	try {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send();
		return xhr.responseText;
	} catch (e) {
		return '{"message":+"'+e.description+'"}'; // turn all errors into empty results
	}
}

