/*global describe, it, beforeEach, inject, expect, module,returnedClassyArrayModule*/
(function () {
	'use strict';

	describe('Multiple Classy Controllers using array', function () {

		
		beforeEach(module('array-classy'));

		describe('first controller', function() {
			var ctrl, scope;
			var ctrlName = 'hello';

			beforeEach(inject(function ($controller, $rootScope) {
				scope = $rootScope.$new();
				ctrl = $controller(ctrlName, { $scope: scope });
			}));

			it('should have foo set to `bar`', function () {
				expect(scope.foo).toBe('bar');
			});
		});

		describe('second controller', function() {
			var ctrl, scope;
			var ctrlName = 'goodbye';

			beforeEach(inject(function ($controller, $rootScope) {
				scope = $rootScope.$new();
				ctrl = $controller(ctrlName, { $scope: scope });
			}));

			it('should have foo set to `baz`', function () {
				expect(scope.foo).toBe('baz');
			});
		});

		describe('controllers array', function() {
			it('should return the module', function () {
				expect(returnedClassyArrayModule.factory).toBeDefined();
			});
		});

	});
}());
