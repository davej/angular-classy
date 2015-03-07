module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['benchmark', 'jasmine'],
    reporters: ['benchmark'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'angular-classy.js',
      'examples/todomvc/js/app.js',
      'examples/todomvc/js/*/*.js',
      'test/benchmarks/creation.js',
    ],
    autoWatch: false,
    singleRun: true,
    browsers: ['Firefox', 'PhantomJS']
  });
};
