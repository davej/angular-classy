/*global describe, it, beforeEach, inject, expect, module,returnedClassyArrayModule*/
(function () {
  'use strict';

  describe('Classy Plugin Options', function () {

    beforeEach(module('options-classy'));

    describe('first controller', function() {
      var ctrl, scope;
      var ctrlName = 'optionsOne';

      beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller(ctrlName, { $scope: scope });
      }));

      it('should not have any properties from data', function () {
        expect(scope.foo).toBeUndefined();
        expect(ctrl.foo).toBeUndefined();

        expect(scope.bar).toBeUndefined();
        expect(ctrl.bar).toBeUndefined();
      });

      it('should not have any properties from methods', function () {
        expect(scope.fooMethod).toBeUndefined();
        expect(ctrl.fooMethod).toBeUndefined();

        expect(scope.barMethod).toBeUndefined();
        expect(ctrl.barMethod).toBeUndefined();
      });


      it('should have `baz` property on scope and class', function () {
        expect(scope.baz).toBeDefined();
        expect(ctrl.baz).toBeDefined();
      });


    });


    describe('second controller', function() {
      var ctrl, scope;
      var ctrlName = 'optionsTwo';

      beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller(ctrlName, { $scope: scope });
      }));

      it('should not have any properties from data', function () {
        expect(scope.foo).toBeDefined();
        expect(ctrl.foo).toBeUndefined();

        expect(scope.bar).toBeDefined();
        expect(ctrl.bar).toBeUndefined();
      });

      it('should not have any properties from methods', function () {
        expect(scope.fooMethod).toBeUndefined();
        expect(ctrl.fooMethod).toBeDefined();

        expect(scope.barMethod).toBeUndefined();
        expect(ctrl.barMethod).toBeDefined();
      });


      it('should have `baz` property on scope and class', function () {
        expect(scope.baz).toBeDefined();
        expect(ctrl.baz).toBeDefined();
      });


    });


  });

}());
