var download = require('./lib/downloader').download

function registerClass(term, crn, studentId, studentPin){
	download({
				host: 'oscar.gatech.edu'
			,	path: '/pls/bprod/twbkwbis.P_WWWLogin'
			,	method: 'GET'
		}, function(err, buffer, res){
				if ( err ){throw err}
				cookies = ((res.headers['set-cookie']||"") + "").split(";").shift()
				
			// POST login page with cookies we got from the login page
			preformLogin(cookies, studentId, studentPin, function(err, cookies){
				if ( err ){ console.log(err); return; }
				selectTerm(cookies, term, function(err, cookies){
					if ( err ){ console.log(err); return; }
				})
			})

	})
}

function preformLogin(jar, studentId, studentPin, next){
	download({
				host: 'oscar.gatech.edu'
			,	path: '/pls/bprod/twbkwbis.P_ValLogin'
			,	method: 'POST'
			,	data: {
						sid: studentId
					,	PIN: studentPin
				}
			,	referer: 'oscar.gatech.edu/pls/bprod/twbkwbis.P_WWWLogin'
			, headers: {
					Cookie: jar
			}
		}, function(err, html, res){
				if ( err ){throw err}
				cookies = ((res.headers['set-cookie']||"") + "").split(";").shift()
				if ( html.match(/Authorization Failure/) ){
					next(new Error('Authorization Failure'))
				}else if ( html.match(/Welcome,\+([^,]+),/) ){
					userName = html.match(/Welcome,\+([^,]+),/)[1].replace(/\+/g, ' ')
					console.log("Successfully logged in as:", userName );
					next(null, cookies)
				}
	})
}

function selectTerm(jar, term, next){
	download({
				host: 'oscar.gatech.edu'
			,	path: '/pls/bprod/bwskfreg.P_AltPin'
			,	method: 'POST'
			,	data: {
						term_in: term
				}
			, headers: {
					Cookie: jar
			}
		}, function(err, html, res){
				if ( err ){ next(err); return }
				cookies = ((res.headers['set-cookie']||"") + "").split(";").shift()
				if ( html.match(/no Registration Time Ticket/i) ){
					next(new Error('No Time Ticket'))
				}else if ( true ){
					console.log("Dont know what to do from here");
					next(null, cookies)
				}
	})
}


// If we are run directly
if ( require.main === module ){
	registerClass('201208', '----', '902462499', '096121')
}
