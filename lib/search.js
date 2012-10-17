var natural = require('natural')
	,	_ = require('underscore')

exports.searchResultsToObject = searchResultsToObject = function(collection, results, next){
	var objects = new Array(results.length)
		,	added = 0;
	if ( results.length === 0){
		next(null, []);
		return;
	}
	_.each(results, function(object, i, allObjects){
		collection.findById(object._id).exec(function(err, realObjects){
			objects[i] = {object: realObjects, rank: object.value};
			if ( (++added) >= allObjects.length ){
				next(null, objects);
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
		collection.count(function(err, totalDocs){
			var o = {}
				,	queryTokens = natural.LancasterStemmer.tokenizeAndStem(search.string);
			if ( err ){
				next(err);
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
					searchResultsToObject(collection, results, next);
				}else{
					next(null, results);
				}
			})// End map-reduce
		})// End Total Count
}