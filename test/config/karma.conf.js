module.exports = function(config) {
  config.set({
    basePath: '../../',
    frameworks: ['jasmine'],
    files: [
	    'test/bower_components/angular/angular.js',
	    'test/bower_components/angular-mocks/angular-mocks.js',
		  'angular-classy.min.js',
		  'examples/todomvc/js/app.js',
		  'examples/todomvc/js/*/*.js',
		  'test/unit/*.js'
    ],
    autoWatch: true,
    singleRun: true,
    browsers: ['Firefox']
  });
};

