/*global describe, it, beforeEach, inject, expect, module, returnedClassyArrayModule*/
(function () {
  'use strict';

  describe('Classy Plugin Options', function () {

    beforeEach(module('options-classy'));

    describe('first component', function() {
      var ctrl, el;

      it('should use `el` as key for `selector`', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-one-ignore></options-one-ignore>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsOneIgnore');
        });

        expect(el).toBeDefined();
        expect(ctrl).toBeUndefined();
      });

      it('should use `fn` as key for `methods`', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-one></options-one>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsOne');
        });

        expect(el).toBeDefined();
        expect(ctrl).toBeDefined();

        expect(ctrl.fooMethod).toBeDefined();
        expect(ctrl.barMethod).toBeDefined();
        expect(ctrl.bazMethod).toBeUndefined();
        expect(ctrl.$scope).toBeUndefined();
      });

    });

    describe('second component', function() {
      var ctrl, el;

      it('should use `elem` as key for `el`', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-two-ignore></options-two-ignore>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsTwoIgnore');
        });

        expect(el).toBeDefined();
        expect(ctrl).toBeUndefined();
      });

      it('should use `funcs` as key for `fn`', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-two></options-two>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsTwo');
        });

        expect(el).toBeDefined(ctrl);
        expect(ctrl).toBeDefined();

        expect(ctrl.fabMethod).toBeDefined();
        expect(ctrl.barMethod).toBeDefined();
        expect(ctrl.fooMethod).toBeUndefined();
        expect(ctrl.bazMethod).toBeUndefined();

        expect(ctrl.$scope).toBeDefined();
        expect(ctrl.$scope.baz).toBe('baz');
        expect(ctrl.baz).toBeUndefined();
      });

    });

  });

  /*

  // BROKEN: options are persisting across modules

  describe('Classy Plugin Options', function () {

    beforeEach(module('options-classy-shorthand'));

    describe('first controller', function() {
      var ctrl, el;

      it('should be disabled', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-one></options-one>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsOne');
        });

        console.log(ctrl, el)

        expect(el).toBeDefined();
        expect(ctrl).toBeUndefined();
      });
    });


    describe('second controller', function() {
      var ctrl, el;

      it('should be enabled', function () {
        inject(function ($compile, $rootScope) {
          el = angular.element("<options-two></options-two>");
          $compile(el)($rootScope.$new());
          $rootScope.$digest();
          ctrl = el.controller('optionsTwo');
        });
        console.log(ctrl, el)


        expect(el).toBeDefined();
        expect(ctrl).toBeDefined();

        expect(ctrl.fooMethod).toBeDefined();
        expect(ctrl.barMethod).toBeDefined();
        expect(ctrl.bazMethod).toBeUndefined();
        expect(ctrl.baz).toBe('baz');
      });

    });

  });
  */


}());
