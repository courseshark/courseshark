#!./bin/node/bin/node

(function(env){
  var school = ''
    , term = ''
    , config_file = require('yaml-config')
    , config = config_file.readConfig(__dirname + '/config.yaml')
    , mongoose = require('mongoose')

  if ( config.db.uri.indexOf(',') == -1 ){
    mongoose.connect(config.db.uri, function(err){if(err){console.log('mongoose-single:',err)}})
  }else{
    mongoose.connectSet(config.db.uri, function(err){if(err){console.log('mongoose-rs:',err)}})
  }

  if ( process.argv.length < 4 ){
    console.log('Error: usage is `node crawl.js [school.abbr] [term.number] <cache>`')
    return;
  }else{
    school = process.argv[2].toLowerCase()
    term = parseInt(process.argv[3],10)+''
  }

  var crawler = require('./lib/crawler')

  if ( typeof crawler[school] !== 'object' ){
    console.log('Error: No such school '+school)
    return;
  }


  if ( process.argv.length >= 5 ){
    if ( process.argv[4].toLowerCase() === 'cache' ){
      crawl = crawler[school].cacheCrawl()
      crawl.on('done', function(d){
        console.log('Finished Storing Cache:', school)
        crawler[school]['mongoose'].connection.close()
      })
      return;
    }
  }

  crawl = crawler[school].crawl(term)
  crawl.on('done', function(d){
    console.log('Finished Crawling:', school)
    crawler[school]['mongoose'].connection.close()
  })


})(this)