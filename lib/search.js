var natural = require('natural')
	,	_ = require('underscore')

exports.searchResultsToObject = searchResultsToObject = function(collection, results, options, next){
	var objects = new Array(results.length)
		,	added = 0;
	if ( results.length === 0){
		next(null, []);
		return;
	}
	_.each(results, function(object, i, allObjects){
		query = collection.findById(object._id)
		if ( options.populateList ){
			for(var l=0;l<options.populateList.length;l++){
				query.populate(options.populateList[l].toString())
			}
		}
		query.exec(function(err, realObject){
			if ( !realObject ){ return; }

			// If set, pull the sections associated with this course
			// -- but only those who are in the term we are searching
			if ( options.pullSections ){
				(function(obj){
					Section.find({course: obj._id, term: options.term}).exec(function(err, sections){
						obj.sections = sections;
						objects[i] = {object: obj, rank: object.value};
						if ( (++added) >= allObjects.length ){
							next(null, objects);
						}
					})
				})(realObject.toObject())
			}else{
				objects[i] = {object: realObject, rank: object.value};
				if ( (++added) >= allObjects.length ){
					next(null, objects);
				}
			}
		});
	});
}


exports.searchCollection = function(collection, search, options, next) {
		if (typeof options === 'function' ){
			next = options;
			options = {};
			options.numberScale = 1/1000;
			options.returnObjects = false;
		}

		options.term = search.term

		collection.count(function(err, totalDocs){
			var o = {}
				,	queryTokens = natural.PorterStemmer.tokenizeAndStem(search.string);
			if ( err ){
				next(err);
			}


			for(var i=0,arr=search.string.split(' '),_len=arr.length;i<_len;i++){
				if ( arr[i] == 'i' ) {
					queryTokens.push('1')
				}
				else if ( arr[i] == 'ii' ) {
					queryTokens.push('2')
				}
				else if ( arr[i] == 'iii' ) {
					queryTokens.push('2')
				}
				else if ( arr[i] == '1' ) {
					queryTokens.push('i')
				}
				else if ( arr[i] == '2' ) {
					queryTokens.push('ii')
				}
				else if ( arr[i] == '3' ) {
					queryTokens.push('iii')
				}
			}

			query = search.query;
			query._tokens = {$in: queryTokens};
			o.query = query;

			o.scope = {
									queryTokens: queryTokens
								, docsWithTerm: 1
								, totalDocs: totalDocs
								, maxNum: 0
								, numberScale: options.numberScale
								, console: console
								};
			o.map = function(queryTokens){ return function () {
					var data = {tf: 0, df: 0, num: parseInt(this._tokens[0].replace(/[^0-9]/,''),10) || 0}
						,	tf;
					for (var i=0,_len=queryTokens.length; i<_len; i++){
						tf = 0;
						for (var j=0,__len=this._tokens.length; j<__len; j++) {
							if ( queryTokens[i] == this._tokens[j] ){
								tf += 1/this._tokens.length;
							}
						}
						data.tf += tf;
					}
					if (tf > 0){
						docsWithTerm++;
					}
					if ( data.num > maxNum ){ maxNum = data.num; }
					// Replace this with the id, so we can just query them later for the full doc.
					emit(this._id, data);
				}}(queryTokens);
			o.reduce = function (k, vals) {
				var result = { tf: 0, df: 0, num:0};
				vals.forEach(function(value) {
					result.tf += value.tf;
					result.df += value.df;
					result.num = value.num;
				});
				return result;
			}
			o.finalize = function (k, val){
				var idf = Math.log(totalDocs / docsWithTerm);
				val.tf = val.tf / queryTokens.length
				return val.tf * idf + (val.num<=0||isNaN(val.num)?0:( (maxNum/val.num) * (1/idf) * numberScale ));
			};
			o.verbose = true;
			collection.mapReduce(o, function (err, results) {
				if ( err ){
					next(err);
					return;
				}
				results.sort(function(a,b){ return parseFloat(b.value) - parseFloat(a.value) })
				if  ( options.returnObjects ){
					searchResultsToObject(collection, results, options, next);
				}else{
					next(null, results);
				}
			})// End map-reduce
		})// End Total Count
}