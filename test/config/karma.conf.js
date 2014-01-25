module.exports = function(config) {
  config.set({
    basePath: '../../',
    frameworks: ['jasmine'],
    files: [
  	  'examples/todomvc/bower_components/angular/angular.js',
		  'angular-classy.js',
		  'bower_components/angular/angular.js'
		  'examples/todomvc/bower_components/angular-mocks/angular-mocks.js',
		  'examples/todomvc/js/app.js',
		  'examples/todomvc/js/*/*.js',
		  'test/unit/*.js'
    ],
    autoWatch: true,
    browsers: ['Chrome']
  });
};

