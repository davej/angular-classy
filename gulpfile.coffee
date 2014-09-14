gulp = require("gulp")
concat = require("gulp-concat")
insert = require("gulp-insert")
path = require("path")
es = require("event-stream")
coffee = require("gulp-coffee")
gutil = require('gulp-util')
uglify = require('gulp-uglify')
rename = require('gulp-rename')

###
  `default` Action - Builds Angular Classy

  1. Get's the names of all the classy plugins
  2. Concatenates the core + all the plugins into one coffee file
  3. Appends some code to register the plugins with classy
  4. Outputs the coffee file (`angular-classy.coffee`)
  5. Convert the CoffeeScript to a JS File (`angular-classy.js`)
  6. Uglify (minify) the JS File (`angular-classy.min.js`)
###
gulp.task "default", [ "minify" ]

pluginNames = []
gulp.task "getPluginsNames", ->
  buildNames = (es) ->
    es.mapSync (file) ->
      pluginNames.push path.basename(file.path, ".coffee")
      file

  gulp.src "./src/classy-*.coffee"
    .pipe buildNames(es)

gulp.task "concatAndRegisterPlugins", [ "getPluginsNames" ], ->
  gulp.src "./src/*classy*.coffee"
    .pipe concat("angular-classy.coffee")
    .pipe insert.append("\nangular.module 'classy', " + JSON.stringify(pluginNames))
    .pipe gulp.dest("./")

gulp.task "coffeeToJs", [ "concatAndRegisterPlugins" ], ->
  gulp.src "./angular-classy.coffee"
    .pipe coffee().on('error', gutil.log)
    .pipe gulp.dest("./")

gulp.task "minify", [ "coffeeToJs" ], ->
  gulp.src "./angular-classy.js"
    .pipe uglify()
    .pipe rename suffix: '.min'
    .pipe gulp.dest("./")

###
  `test` Action - Uses Karma

  Runs tests in both Firefox and Phantom
###

karma = require('node-karma-wrapper')

karmaConfig = './test/karma.conf.js'
karmaTest = karma(configFile: karmaConfig)
karmaPhantom = karma(configFile: karmaConfig, browsers: ['PhantomJS'])
karmaFirefox = karma(configFile: karmaConfig, browsers: ['Firefox'])

gulp.task "test", ["default"], (cb) -> karmaTest.simpleRun(cb)
gulp.task "testFirefox", ["default"], (cb) -> karmaFirefox.simpleRun(cb)
gulp.task "testPhantom", ["default"], (cb) -> karmaPhantom.simpleRun(cb)
