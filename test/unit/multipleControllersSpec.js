/*global describe, it, beforeEach, inject, expect, module,returnedClassyArrayModule*/
(function () {
	'use strict';

	describe('Single Classy Controllers', function () {


		beforeEach(module('normal-classy'));

		describe('first controller', function() {
			var ctrl, el;

			beforeEach(inject(function ($compile, $rootScope) {
				el = angular.element("<hello></hello>");
				$compile(el)($rootScope.$new());
				$rootScope.$digest();
				ctrl = el.controller('hello');
			}));

			it('should have foo set to `bar`', function () {
				expect(ctrl.foo).toBe('bar');
			});
		});


		describe('controllers array', function() {
			it('should return the module', function () {
				expect(angular.isFunction(returnedClassyNormalModule)).toBeTruthy();
			});
		});

	});

	describe('Multiple Classy Controllers using array', function () {

		beforeEach(module('array-classy'));

		describe('first controller', function() {
			var ctrl, el;

			beforeEach(inject(function ($compile, $rootScope) {
				el = angular.element("<hello></hello>");
				$compile(el)($rootScope.$new());
				$rootScope.$digest();
				ctrl = el.controller('hello');
			}));

			it('should have foo set to `bar`', function () {
				expect(ctrl.foo).toBe('bar');
			});
		});

		describe('second controller', function() {
			var ctrl, el;

			beforeEach(inject(function ($compile, $rootScope) {
				el = angular.element("<goodbye></goodbye>");
				$compile(el)($rootScope.$new());
				$rootScope.$digest();
				ctrl = el.controller('goodbye');
			}));

			it('should have foo set to `baz`', function () {
				expect(ctrl.foo).toBe('baz');
			});
		});

		describe('controllers array', function() {
			it('should return the module', function () {
				expect(angular.isFunction(returnedClassyArrayModule)).toBeFalsy();
				expect(returnedClassyArrayModule.factory).toBeDefined();
			});
		});

	});
}());
