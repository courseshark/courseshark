var fs = require('fs');
	
exports.build = function(app){
	buildApplication(app)
}

function buildApplication(app){
  var mcss
    , mjs
    , foundCSS=false
    , foundJS=false
    
  if ( app.settings.env == 'development' ){
    return;
  }
	// Remove the old css files
	fs.readdir(__dirname+'/public/styles/', function(err, files){
		for( var i=0,len=files.length; i<len; i++ ){
			if( (mcss=files[i].match(/([0-9a-zA-Z]+)\-courseshark\.css/)) !== null ){
        foundCSS = true
				if ( mcss[1] != app.settings.revision ){
					fs.unlink(__dirname+'/public/styles/'+files[i])
					compileCSS(app)
				}
			}
		}
		if (!foundCSS){
			compileCSS(app)
		}
	})
	// Remove old js files
	fs.readdir(__dirname+'/public/scripts/', function(err, files){
		for( var i=0,len=files.length; i<len; i++ ){
			if( (mjs=files[i].match(/([0-9a-zA-Z]+)\-courseshark\.js/)) !== null ){
				foundJS = true
        if ( mjs[1] != app.settings.revision ){
					fs.unlink(__dirname+'/public/scripts/'+files[i])
          compileJS(app)
				}
			}
		}
		if (!foundJS){
			compileJS(app)
		}
	})
}

function compileCSS(app){
  var less = require('less'),
      parser = new(less.Parser)({ paths: [__dirname+'/public/styles/', __dirname+'/public/styles/lib'], filename: 'master.less'}),
      rawCss = "";
  try {
    rawCss = fs.readFileSync(__dirname+'/public/styles/master.less', 'ascii');
  }
  catch (err) {
    console.error("There was an error opening the file: master.less");
  }
  parser.parse(rawCss, function (e, tree) {
      output = tree.toCSS({ compress: true }); // Minify CSS output
      fs.writeFile(__dirname+'/public/styles/'+app.settings.revision+'-courseshark.css', output, function(err) {
          if(err) { console.log(err) }
      });
  });
}


function compileJS(app){
  var jsp = require("uglify-js").parser,
      pro = require("uglify-js").uglify,
      jsDir = __dirname+'/public/scripts/',
      jsFiles = [ "lib/jquery.min.js",
                  "lib/jquery-ui.min.js",
                  "modernizr.js",
                  "master.js",
                  "dialog.js",
                  "micro-template.js",
                  "schedule.js",
                  "notification.js",
                  "friendsSearch.js",
                  "social.js",
                  "jquery.base64.min.js",
                  "dateFormat.js",
                  "lib/bootstrap-transition.js",
                  "lib/bootstrap-modal.js",
                  "lib/bootstrap-dropdown.js",
                  "lib/bootstrap-collapse.js",
                  "lib/bootstrap-tooltip.js",
                  "lib/bootstrap-popover.js",
                  "lib/select2.min.js",
                  "lib/bootstrap-tab.js"
                ],
      origJS = "";
  
  for ( var i in jsFiles ){
    try {
      origJS += fs.readFileSync(jsDir+jsFiles[i], 'ascii') + "\n;\n";
    }
    catch (err) {
      console.error("There was an error opening the file: ", jsFiles[i]);
    }
  }
    
  var ast = jsp.parse(origJS); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast); // compressed code here
  fs.writeFile(__dirname+'/public/scripts/'+app.settings.revision+'-courseshark.js', final_code, function(err) {
      if(err) { console.log(err) }
  });
}
