
/*
Angular Classy 0.3
Dave Jeffery, @DaveJ
License: MIT
 */


/* global angular */

(function() {
  'use strict';
  var classFns, origMethod,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  classFns = {
    selectorControllerCount: 0,
    construct: function(parent, args) {
      this.bindDependencies(parent, args);
      this.addFnsToScope(parent);
      if (typeof parent.init === "function") {
        parent.init();
      }
      if (angular.isObject(parent.watch)) {
        return this.registerWatchers(parent);
      }
    },
    addFnsToScope: function(parent) {
      var $scope, fn, key, _ref, _results;
      $scope = parent[parent.constructor.prototype.__classyControllerScopeName];
      _ref = parent.constructor.prototype;
      _results = [];
      for (key in _ref) {
        fn = _ref[key];
        if (!angular.isFunction(fn)) {
          continue;
        }
        if ((key === 'constructor' || key === 'init' || key === 'watch') || key[0] === '_') {
          continue;
        }
        _results.push($scope[key] = angular.bind(parent, fn));
      }
      return _results;
    },
    bindDependencies: function(parent, args) {
      var i, injectName, injectObject, injectObjectMode, key, _i, _len, _ref, _results;
      injectObject = parent.__classyControllerInjectObject;
      injectObjectMode = !!injectObject;
      _ref = parent.constructor.$inject;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        key = _ref[i];
        if (injectObjectMode && (injectName = injectObject[key]) && injectName !== '.') {
          _results.push(parent[injectName] = args[i]);
        } else {
          _results.push(parent[key] = args[i]);
        }
      }
      return _results;
    },
    registerWatchers: function(parent) {
      var $scope, expression, fn, keyword, watchRegistered, watchType, watchTypes, _i, _len, _ref, _ref1, _results;
      $scope = parent[parent.constructor.prototype.__classyControllerScopeName];
      watchTypes = {
        normal: {
          keywords: [],
          fnCall: function(parent, expression, fn) {
            return $scope.$watch(expression, angular.bind(parent, fn));
          }
        },
        objectEquality: {
          keywords: ['{object}', '{deep}'],
          fnCall: function(parent, expression, fn) {
            return $scope.$watch(expression, angular.bind(parent, fn), true);
          }
        },
        collection: {
          keywords: ['{collection}', '{shallow}'],
          fnCall: function(parent, expression, fn) {
            return $scope.$watchCollection(expression, angular.bind(parent, fn));
          }
        }
      };
      _ref = parent.watch;
      _results = [];
      for (expression in _ref) {
        fn = _ref[expression];
        if (angular.isString(fn)) {
          fn = parent[fn];
        }
        if (angular.isString(expression) && angular.isFunction(fn)) {
          watchRegistered = false;
          for (watchType in watchTypes) {
            if (watchRegistered) {
              break;
            }
            _ref1 = watchTypes[watchType].keywords;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              keyword = _ref1[_i];
              if (watchRegistered) {
                break;
              }
              if (expression.indexOf(keyword) !== -1) {
                watchTypes[watchType].fnCall(parent, expression.replace(keyword, ''), fn);
                watchRegistered = true;
              }
            }
          }
          if (!watchRegistered) {
            _results.push(watchTypes.normal.fnCall(parent, expression, fn));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    inject: function(parent, deps) {
      var injectObject, name, service;
      if (angular.isObject(deps[0])) {
        parent.prototype.__classyControllerInjectObject = injectObject = deps[0];
        deps = (function() {
          var _results;
          _results = [];
          for (service in injectObject) {
            name = injectObject[service];
            _results.push(service);
          }
          return _results;
        })();
        if ((injectObject != null ? injectObject['$scope'] : void 0) && injectObject['$scope'] !== '.') {
          parent.prototype.__classyControllerScopeName = injectObject['$scope'];
        }
      }
      return parent.$inject = deps;
    },
    registerSelector: function(appInstance, selector, parent) {
      var controllerName, el, els, _i, _len, _results;
      this.selectorControllerCount++;
      controllerName = "ClassySelector" + this.selectorControllerCount + "Controller";
      appInstance.controller(controllerName, parent);
      if (angular.isElement(selector)) {
        selector.setAttribute('data-ng-controller', controllerName);
        return;
      }
      if (angular.isString(selector)) {
        els = (typeof window.jQuery === "function" ? window.jQuery(selector) : void 0) || document.querySelectorAll(selector);
      } else if (angular.isArray(selector)) {
        els = selector;
      } else {
        return;
      }
      _results = [];
      for (_i = 0, _len = els.length; _i < _len; _i++) {
        el = els[_i];
        if (angular.isElement(el)) {
          _results.push(el.setAttribute('data-ng-controller', controllerName));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    create: function(appInstance, classObj, parent) {
      var deps;
      if (classObj.el || classObj.selector) {
        this.registerSelector(appInstance, classObj.el || classObj.selector, parent);
      }
      if (angular.isString(classObj.name)) {
        appInstance.controller(classObj.name, parent);
      }
      deps = classObj.inject;
      if (angular.isArray(deps)) {
        return this.inject(parent, deps);
      } else if (angular.isObject(deps)) {
        return this.inject(parent, [deps]);
      }
    }
  };

  origMethod = angular.module;

  angular.module = function(name, reqs, configFn) {

    /*
     * We have to override the `angular.module` method to see if 'classy' has been specified
     * as a requirement. We also need the module name to we can register our classy controllers.
     * Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
     */
    var module;
    module = origMethod(name, reqs, configFn);
    if (reqs && __indexOf.call(reqs, 'classy') >= 0) {
      module.cC = module.classyController = function(classObj) {
        var c, classyController, key, value;
        c = classyController = (function() {
          classyController.prototype.__classyControllerScopeName = '$scope';

          classFns.create(module, classObj, classyController);

          function classyController() {
            classFns.construct(this, arguments);
          }

          return classyController;

        })();
        for (key in classObj) {
          if (!__hasProp.call(classObj, key)) continue;
          value = classObj[key];
          c.prototype[key] = value;
        }
        return c;
      };
    }
    return module;
  };

  angular.module('classy', []);

}).call(this);
