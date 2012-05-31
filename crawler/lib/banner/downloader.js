(function(ex){
	var urls
	, cache
	, https = require('https')
	, querystring = require('querystring')
	, jsdom = require('jsdom')
	, fs = require('fs')
	, url =  require('url')
	, jq = fs.readFileSync(__dirname + '/jquery-1.7.min.js').toString()
	, school = ''

	urls = { termList: "/pls/bprod/bwckschd.p_disp_dyn_sched"
			, term: "/pls/bprod/bwckgens.p_proc_term_date"
			, listing: "/pls/bprod/bwckschd.p_get_crse_unsec"
			, details: "/pls/bprod/bwckschd.p_disp_detail_sched" }

	function init(s){
		school = s
	}
	function download(options, callback){
		var isPostRequest, req
		options.agent = new https.Agent({
			secureProtocol: 'SSLv3_method',
			secureOptions: require('constants').SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS
		});
		options.method = options.method!==undefined ? String(options.method).toUpperCase() : "GET"
		console.log(typeof(options.data), options.data, querystring.stringify(options.data))
		options.data = options.data!==undefined ? querystring.stringify(options.data) : undefined
		isPostRequest = (options.data !== undefined && options.method === "POST")
		options.headers = isPostRequest ? {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': options.data.length } : options.headers
		
		if ( !isPostRequest && options.data.length ){
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
				jsdom.env({ html: buffer, src: [jq], done: function(err, window){
					if ( err ){
						console.log('Download error', err);
					}else{
						callback(window, buffer);
					}
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

	function downloadDepartments(term, callback){
		var data, options
		data = {
				p_calling_proc: "bwckschd.p_disp_dyn_sched"
			,	p_term: String(term)
		}
		options = {host: school.url, path: school.paths.term, method: 'POST', data: data}
		download(options, callback)
	}

	function downloadSections(term, departmentAbbr, callback){
		var data, options
		data = {
				term_in: term
			,	sel_subj: ["", departmentAbbr]
			,	sel_day: ""
			,	sel_schd: ""
			,	sel_insm: ""
			,	sel_camp: ["", "%"]
			,	sel_levl: ""
			,	sel_sess: ""
			,	sel_instr: ["", "%"]
			,	sel_ptrm: ""
			,	sel_attr: ["", "%"]

			,	sel_crse: ""
			,	sel_title: ""

			,	sel_from_cred: ""
			,	sel_to_cred: ""

			,	begin_hh: "0"
			,	begin_mi: "0"
			,	begin_ap: "a"

			,	end_hh: "0"
			,	end_mi: "0"
			,	end_ap: "a"
		}
		options = {host: school.url, path: school.paths.listing, method: 'POST', data: data}
		download(options, callback)
	}


	function downloadSectionDetails(section, term, callback){
		var data, options
		data = {
				term_in: ''+term.number
			,	crn_in: ''+section.number
		}
		console.log('data:', data)
		options = {host: school.url, path: school.paths.details, method: 'GET', data: data}
		download(options, callback)
	}

	ex.init = init
	ex.download = download
	ex.downloadDepartments = downloadDepartments
	ex.downloadSections = downloadSections
	ex.downloadSectionDetails = downloadSectionDetails
	
})(exports);
