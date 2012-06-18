module.exports = function(req, res, next) {

	req.query = objectify(req.query)

	req.body = objectify(req.body)

	next()
}

function objectify(stringObj){
	var search, q, i, v, w, s;
	search = stringObj || {}
	q = {}
	for ( i in search ){
		if ( !stringObj.hasOwnProperty(i) ){continue;}
		if ( stringObj[i] === '' ){continue;}
		s = i.split(/\./)
		w = q;
		for (v=0,len=s.length; v<len; v++ ){
			w = w[s[v]]?w[s[v]]:(w[s[v]]=(v==s.length-1?search[i]:{}))
		}
	}
	return q
}