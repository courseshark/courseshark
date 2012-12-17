({
// Load the configurations from main.js
mainConfigFile: './main.js',

// Output file
out: './build.main.js',

// The main paths
paths:
  {
    requireLib: 'lib/require/require',
    main: './main'
  },

// Which file is the one we should compile?
name: 'main',

// Include the require libraries into the compiled file
include: 'requireLib',

// Uglify the output
optimize: "uglify",

// Uglify settings
uglify:
  {
    toplevel: true,
    ascii_only: true,
    beautify: false,
    max_line_length: 1000,
    no_mangle: false
  },

// Dont try and optimize CSS
optimizeCss: "none",

// Inlines the text for any text! dependencies, to avoid the separate
// async XMLHttpRequest calls to load those dependencies.
inlineText: true,

// Files that were combined into a build layer will be
// removed from the output folder.
removeCombined: true
})