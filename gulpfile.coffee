gulp = require("gulp")
concat = require("gulp-concat")
insert = require("gulp-insert")
path = require("path")
es = require("event-stream")
coffee = require("gulp-coffee")
gutil = require('gulp-util')
uglify = require('gulp-uglify')
rename = require('gulp-rename')
closure = require('gulp-jsclosure')
sourcemaps = require('gulp-sourcemaps')

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
      pluginNames.push "classy.#{path.basename(file.path, ".js")}"
      file

  gulp.src "./src/*.js"
    .pipe buildNames(es)

gulp.task "concatAndRegisterPlugins", [ "getPluginsNames" ], ->
  gulp.src ["./src/core.js", "./src/*.js"]
    .pipe concat("angular-classy.js")
    .pipe insert.append("\nangular.module('classy', " + JSON.stringify(pluginNames) + ");")
    .pipe closure()
    .pipe gulp.dest("./")

gulp.task "minify", [ "concatAndRegisterPlugins" ], ->
  gulp.src "./angular-classy.js"
    .pipe sourcemaps.init()
    .pipe uglify()
    .pipe rename suffix: '.min'
    .pipe sourcemaps.write("./")
    .pipe gulp.dest("./")

gulp.task "watch", ["default"], -> gulp.watch "./src/*.js", ['minify']

###
  `test` Action - Uses Karma

  Runs tests in both Firefox and Phantom
###

karma = require('node-karma-wrapper')

karmaConfig = './test/karma.conf.js'
karmaBenchConfig = './test/karma.bench.conf.js'

karmaTest = karma(configFile: karmaConfig)
karmaBench = karma(configFile: karmaBenchConfig)

karmaPhantom = karma(configFile: karmaConfig, browsers: ['PhantomJS'])
karmaFirefox = karma(configFile: karmaConfig, browsers: ['Firefox'])

karmaBenchPhantom = karma(configFile: karmaBenchConfig, browsers: ['PhantomJS'])
karmaBenchFirefox = karma(configFile: karmaBenchConfig, browsers: ['Firefox'])

gulp.task "test", ["default"], (cb) -> karmaTest.simpleRun(cb)
gulp.task "testFirefox", ["default"], (cb) -> karmaFirefox.simpleRun(cb)
gulp.task "testPhantom", ["default"], (cb) -> karmaPhantom.simpleRun(cb)

gulp.task "bench", ["default"], (cb) -> karmaBench.simpleRun(cb)
gulp.task "benchFirefox", ["default"], (cb) -> karmaBenchPhantom.simpleRun(cb)
gulp.task "benchPhantom", ["default"], (cb) -> karmaBenchFirefox.simpleRun(cb)
