(function(ex){
	var urls
	, cache
	, https = require('https')
	, querystring = require('querystring')
	, jsdom = require('jsdom')
	, jq = 'http://code.jquery.com/jquery-1.7.min.js'
	, parser = require('./parser')

	urls = { termList: "/pls/bprod/bwckschd.p_disp_dyn_sched"
			, term: "/pls/bprod/bwckgens.p_proc_term_date"
			, listing: "/pls/bprod/bwckschd.p_get_crse_unsec"
			, details: "/pls/bprod/bwckschd.p_disp_detail_sched" }


	function download(options, callback){
		var isPostRequest, req
		options.agent = new https.Agent({
			secureProtocol: 'SSLv3_method',
			secureOptions: require('constants').SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS
		});
		options.method = options.method!==undefined ? String(options.method).toUpperCase() : "GET"
		options.data = options.data!==undefined ? querystring.stringify(options.data) : undefined
		isPostRequest = (options.data !== undefined && options.method === "POST")
		options.headers = isPostRequest ? {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': options.data.length } : options.headers
		
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
				jsdom.env({ html: buffer, scripts: [jq], done: function(err, window){
					var $ = window.$;
					callback($, buffer);
					window.close();
				}})
			})
		}).on('error', function(e) {
			console.log('ERROR: ', e.message, e)
		});
		
		// Write the POST data to the request if it has been passed
		if ( isPostRequest ){
			req.write(options.data)
		}
		req.end()
	}

	ex.download = download
})(exports);
