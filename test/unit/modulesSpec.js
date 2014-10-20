/*global describe, it, angular, testFooVar, expect*/
(function () {
	'use strict';


	describe('app1 module', function () {

		it('should be defined', function() {
			expect(angular.module('app1')).toBeDefined();
		});

		it('should *not* be a classy-ful module', function() {
			expect(angular.module('app1').classy).toBeUndefined();
		});

	});

	describe('app2 module', function () {

		it('should be defined', function() {
			expect(angular.module('app2')).toBeDefined();
		});

		it('should be a classy-ful module', function() {
			expect(angular.module('app2').classy).toBeDefined();
		});

		it('should contain the default classy plugins', function() {
			var app = angular.module('app2');
			expect(app.classy.activePlugins['classy-bind-data']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-dependencies']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-methods']).toBeDefined();
			expect(app.classy.activePlugins['classy-register']).toBeDefined();
			expect(app.classy.activePlugins['classy-watch']).toBeDefined();
			expect(app.classy.activePlugins['classy-core']).toBeDefined();
		});

	});

	describe('app3 module', function () {

		it('should be defined', function() {
			expect(angular.module('app3')).toBeDefined();
		});

		it('should be a classy-ful module', function() {
			expect(angular.module('app3').classy).toBeDefined();
		});

		it('should only contain the classy-core module', function() {
			var app = angular.module('app3');
			expect(app.classy.activePlugins['classy-bind-data']).toBeUndefined();
			expect(app.classy.activePlugins['classy-bind-dependencies']).toBeUndefined();
			expect(app.classy.activePlugins['classy-bind-methods']).toBeUndefined();
			expect(app.classy.activePlugins['classy-register']).toBeUndefined();
			expect(app.classy.activePlugins['classy-watch']).toBeUndefined();
			expect(app.classy.activePlugins['classy-core']).toBeDefined();
		});

	});

	describe('app4 module', function () {

		it('should be defined', function() {
			expect(angular.module('app4')).toBeDefined();
		});

		it('should be a classy-ful module', function() {
			expect(angular.module('app4').classy).toBeDefined();
		});

		it('should contain the default classy plugins', function() {
			var app = angular.module('app4');
			expect(app.classy.activePlugins['classy-bind-data']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-dependencies']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-methods']).toBeDefined();
			expect(app.classy.activePlugins['classy-register']).toBeDefined();
			expect(app.classy.activePlugins['classy-watch']).toBeDefined();
			expect(app.classy.activePlugins['classy-core']).toBeDefined();
		});

	});

	describe('app5 module', function () {

		it('should be defined', function() {
			expect(angular.module('app5')).toBeDefined();
		});

		it('should be a classy-ful module', function() {
			expect(angular.module('app5').classy).toBeDefined();
		});

		it('should contain the classy-core module and foo + bar plugins', function() {
			var app = angular.module('app5');
			expect(app.classy.activePlugins['classy-bind-data']).toBeUndefined();
			expect(app.classy.activePlugins['classy-bind-dependencies']).toBeUndefined();
			expect(app.classy.activePlugins['classy-bind-methods']).toBeUndefined();
			expect(app.classy.activePlugins['classy-register']).toBeUndefined();
			expect(app.classy.activePlugins['classy-watch']).toBeUndefined();
			expect(app.classy.activePlugins['classy-core']).toBeDefined();
			expect(app.classy.activePlugins['classy-foo']).toBeDefined();
			expect(app.classy.activePlugins['classy-bar']).toBeDefined();
		});

	});


	describe('app6 module', function () {

		it('should be defined', function() {
			expect(angular.module('app6')).toBeDefined();
		});

		it('should be a classy-ful module', function() {
			expect(angular.module('app6').classy).toBeDefined();
		});

		it('should contain the default classy plugins and foo + bar plugins', function() {
			var app = angular.module('app6');
			expect(app.classy.activePlugins['classy-bind-data']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-dependencies']).toBeDefined();
			expect(app.classy.activePlugins['classy-bind-methods']).toBeDefined();
			expect(app.classy.activePlugins['classy-register']).toBeDefined();
			expect(app.classy.activePlugins['classy-watch']).toBeDefined();
			expect(app.classy.activePlugins['classy-core']).toBeDefined();
			expect(app.classy.activePlugins['classy-foo']).toBeDefined();
			expect(app.classy.activePlugins['classy-bar']).toBeDefined();
		});

		it('should have correct options set when a controller is created', function(){
			var app = angular.module('app6');

			expect(testFooVar).toBeUndefined();
			expect(testBarVar).toBeUndefined();

			app.classy.controller({name: 'testPluginsController'});

			expect(app.__classyPluginDefaults.foo.foo).toBe('boo');
			expect(testFooVar).toBe('baz');
			expect(testBarVar).toBe('baz');
		});

	});

	describe('app7 module', function () {

		it('should be defined', function() {
			expect(angular.module('app7')).toBeDefined();
		});

		it('should *not* be a classy-ful module', function() {
			expect(angular.module('app7').classy).toBeUndefined();
		});

	});

}());

