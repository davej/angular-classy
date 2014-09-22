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

highlight.registerLanguage('coffeescript', coffeeSyntax)
highlight.registerLanguage('javascript', javascriptSyntax)


gulp.task "default", [ "include", "sass" ]

gulp.task "docco", (cb) ->
  docco.document
    args: ['./example_code/todo-app.js', './example_code/todo-app.coffee']
    template: './example_code/code-hint.jst'
    output: './example_code/../'

  setTimeout ->
    cb()
  , 100

highlightJS = (code) -> highlight.highlight('js', code).value
highlightCoffee = (code) -> highlight.highlight('coffee', code).value
highlightHTML = (code) -> highlight.highlight('html', code).value


gulp.task "include", ['docco'], ->
  gulp.src([ "index.template" ])
  .pipe include
    prefix: "@@"
    basepath: "@file"
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
