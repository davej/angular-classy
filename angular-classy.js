/*
Angular Classy 1.0
Dave Jeffery, @DaveJ
License: MIT
*/


/*
Why use angular-classy?
  1. It's class-based, classes are a nice way to organize your code
  2. You can use Coffeescript `Class` syntax, or if you prefer, use the convenient `classyController.create` Javascript function
  3. It's only 2KB (gzipped and minified)
  4. No need to annotate your dependancies to play nicely with minifiers, it just works
  5. Functions are automatically added to the controller's `$scope`, if you want the function to remain private just add a `_` to the function name
  6. It uses a lovely `watch` object for setting up your watchers without polluting the `init` method
*/


/* global angular*/


(function() {
  'use strict';
  var classFns, origMethod,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  classFns = {
    construct: function(parent, args) {
      this.bindDependancies(parent, args);
      this.addFnsToScope(parent);
      if (typeof parent.init === "function") {
        parent.init();
      }
      if (angular.isObject(parent.watch)) {
        return this.registerWatchers(parent);
      }
    },
    addFnsToScope: function(parent) {
      var fn, key, _ref, _results;
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
        _results.push(parent.$scope[key] = angular.bind(parent, fn));
      }
      return _results;
    },
    bindDependancies: function(parent, args) {
      var i, key, _i, _len, _ref, _results;
      _ref = parent.constructor.$inject;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        key = _ref[i];
        _results.push(parent[key] = args[i]);
      }
      return _results;
    },
    registerWatchers: function(parent) {
      var expression, fn, keyword, watchRegistered, watchType, watchTypes, _i, _len, _ref, _ref1, _results;
      watchTypes = {
        normal: {
          keywords: [],
          fnCall: function(parent, expression, fn) {
            return parent.$scope.$watch(expression, angular.bind(parent, fn));
          }
        },
        objectEquality: {
          keywords: ['{object}', '{deep}'],
          fnCall: function(parent, expression, fn) {
            return parent.$scope.$watch(expression, angular.bind(parent, fn), true);
          }
        },
        collection: {
          keywords: ['{collection}', '{shallow}'],
          fnCall: function(parent, expression, fn) {
            return parent.$scope.$watchCollection(expression, angular.bind(parent, fn));
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
    register: function(appInstance, name, deps, parent) {
      parent.$inject = deps;
      return appInstance.controller(name, parent);
    },
    create: function(module, name, deps, proto, parent) {
      var c, key, value, _ref;
      c = (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.register(name, deps, module);

        return _Class;

      })(parent);
      for (key in proto) {
        if (!__hasProp.call(proto, key)) continue;
        value = proto[key];
        c.prototype[key] = value;
      }
      return c;
    }
  };

  origMethod = angular.module;

  angular.module = function(name, reqs, configFn) {
    /*
    # We have to override the `angular.module` method to see if 'classy' has been specified
    # as a requirement. We also need the module name to we can register our classy controllers.
    # Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
    */

    var classyController, module;
    module = origMethod(name, reqs, configFn);
    if (reqs && __indexOf.call(reqs, 'classy') >= 0) {
      classyController = (function() {
        classyController.register = function(name, deps) {
          return classFns.register(module, name, deps, this);
        };

        classyController.create = function(name, deps, proto) {
          return classFns.create(module, name, deps, proto, this);
        };

        function classyController() {
          classFns.construct(this, arguments);
        }

        return classyController;

      })();
      module.classyController = classyController;
    }
    return module;
  };

  angular.module('classy', []);

}).call(this);
