(function(ex){
	var urls
	, cache
	, https = require('https')
	, request = require('request')
	, querystring = require('querystring')
	, jsdom = require('jsdom')
	, fs = require('fs')
	, url =  require('url')
	, jq = fs.readFileSync(__dirname + '/jquery.min.js').toString()
	, school = ''

	urls = { termList: "/pls/bprod/bwckschd.p_disp_dyn_sched"
			, term: "/pls/bprod/bwckgens.p_proc_term_date"
			, listing: "/pls/bprod/bwckschd.p_get_crse_unsec"
			, details: "/pls/bprod/bwckschd.p_disp_detail_sched" }

	function init(s){
		school = s

		request.defaults({jar:request.jar()})
	}
	function download(options, callback){
		var isPostRequest, req
		options.agent = new https.Agent({
			secureProtocol: 'SSLv3_method',
			secureOptions: require('constants').SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS
		});
		options.method = options.method!==undefined ? String(options.method).toUpperCase() : "GET"

		if ( !options.preserveData ){
			options.data = options.data ? querystring.stringify(options.data) : options.data
		}

		isPostRequest = (options.method === "POST")
		options.headers = isPostRequest ? {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': options.data.length } : options.headers||{}

		options.headers['User-Agent'] = 'CourseShark Crawler/nodejs 1.5'
		options.headers['referer'] = options.headers['Referrer'] = options.referer?options.referer:undefined

		if ( !isPostRequest && options.data ){
			options.path += '?'+options.data
		}

		options.uri = 'https://'+options.host+options.path

		options['user-agent'] = options.headers['User-Agent'];
		// Create the request
		req = request(options, function(err, res, body){
			if (err){ return callback(err, null, body); }
			jsdom.env({ html: body||'', src: [jq], done: function(err, window){
				if ( err ){
					callback(err, window, body);
				}else{
					callback(err, window, body);
				}
			}})
		});

		// Write the POST data to the request if it has been passed
		if ( isPostRequest ){
			req.write(options.data)
		}
		//Refererconsole.log(req);
		req.end()
	}

	ex.init = init
	ex.download = download

})(exports);
