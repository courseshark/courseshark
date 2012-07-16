(function(ex){
	var urls
		, https = require('https')
		, querystring = require('querystring')
		, fs = require('fs')
		, url =  require('url')

	function download(options, callback){
		var isPostRequest, req
		options.agent = new https.Agent({
			secureProtocol: 'SSLv3_method',
			secureOptions: require('constants').SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS
		});
		options.method = options.method!==undefined ? String(options.method).toUpperCase() : "GET"
		options.data = options.data ? querystring.stringify(options.data) : options.data
		isPostRequest = (options.method === "POST")

		if ( isPostRequest ){
			if ( typeof options['headers'] !== 'undefined'){
				options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/x-www-form-urlencoded'
				options.headers['Content-Length'] = options.headers['Content-Length'] || options.data.length
			}else{
				options.headers = {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': options.data.length }
			}
		}

		options.headers = options.headers || {}

		options.headers['User-Agent'] = options.headers['User-Agent'] || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:12.0) Gecko/20100101 Firefox/12.0';//CourseShark Registrar/nodejs 1.5'
		options['user-agent'] = options.headers['User-Agent'];
		options.headers['referer'] = options.referer?options.referer:undefined

		if ( !isPostRequest && options.data ){
			options.path += '?'+options.data
		}

		// Create the request
		req = https.request(options, function(res){
			var buffer = ''
			if (res.statusCode == 301){
				urlParts = require('url').parse(res.headers.location)
				options.hostname = urlParts.hostname
				options.host = urlParts.host
				options.path = urlParts.path
				download(options, callback)
				return;
			}
			res.setEncoding('utf-8')
			res.on('data', function(d){
				buffer += d;
			})
			res.on('end', function(){
				callback(null, buffer, res)
			})
		}).on('error', function(e) {
			//console.log('ERROR: ', e.message, "\n", e)
			callback(e)
		});
		
		// Write the POST data to the request if it has been passed
		if ( isPostRequest ){
			req.write(options.data)
		}
		req.end()
	}

	ex.download = download
	
})(exports);
