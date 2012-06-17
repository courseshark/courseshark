module.exports = function(req, res, next) {
	var search, q, i, v, w, s;
	search = req.query || {}
	q = {}
	for ( i in search ){
		if ( !req.query.hasOwnProperty(i) ){continue;}
		if ( req.query[i] === '' ){continue;}
		s = i.split(/\./)
		w = q;
		for (v=0,len=s.length; v<len; v++ ){
			w = w[s[v]]?w[s[v]]:(w[s[v]]=(v==s.length-1?search[i]:{}))
		}
	}
	req.query = q
	next()
}