gulp = require("gulp")
coffee = require("gulp-coffee")
gutil = require('gulp-util')
uglify = require('gulp-uglify')
rename = require('gulp-rename')
include = require('gulp-file-include')
docco = require('docco')
sass = require('gulp-sass')
highlight = require('highlight.js')
coffeeSyntax = require('hljs-classy-site/coffeescript')
javascriptSyntax = require('hljs-classy-site/javascript')
bowerLatest = require('bower-latest')

highlight.registerLanguage('coffeescript', coffeeSyntax)
highlight.registerLanguage('javascript', javascriptSyntax)
classyVersion = null
templateFiles = "*.template"

gulp.task "default", [ "include", "sass" ]

gulp.task "docco", (cb) ->
  docco.document
    args: ['./example_code/todo-app.js', './example_code/todo-app.coffee',
           './example_code/beta/todo-app.js', './example_code/beta/todo-app.coffee',
           './example_code/1.0/todo-app.js', './example_code/1.0/todo-app.coffee',
           ]
    template: './example_code/code-hint.jst'
    output: './example_code/../'


  setTimeout ->
    cb()
  , 100

gulp.task "getVersion", (cb) ->
  bowerLatest 'angular-classy', (component) ->
    console.log component
    console.log "Classy version is: #{component.version}"
    classyVersion = component.version
    cb()

highlightJS = (code) -> highlight.highlight('js', code).value
highlightCoffee = (code) -> highlight.highlight('coffee', code).value
highlightHTML = (code) -> highlight.highlight('html', code).value
getClassyVersion = -> classyVersion

gulp.task "include", ['docco', 'coffee'], ->

  gulp.src(templateFiles)
  .pipe include
    prefix: "@@"
    basepath: "@file"
    classyVersion: classyVersion
    filters:
      highlightJS: highlightJS
      highlightCoffee: highlightCoffee
      highlightHTML: highlightHTML
  .pipe rename
    extname: ".html"
  .pipe gulp.dest("./")

gulp.task "sass", ->
  gulp.src("./styles/main.scss")
  .pipe sass()
  .pipe gulp.dest("./styles/")

gulp.task "coffee", ->
  gulp.src("./scripts/main.coffee")
  .pipe coffee()
  .pipe gulp.dest("./scripts/")

gulp.task "watch", ->
  gulp.watch("./styles/*.scss", ["sass"])
  gulp.watch("./scripts/main.coffee", ["coffee"])
  gulp.watch(templateFiles, ["include"])
  gulp.watch("./example_code/**/*.{js,coffee}", ["include"])
