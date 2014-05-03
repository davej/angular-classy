
/*
Angular Classy 0.4.1
Dave Jeffery, @DaveJ
License: MIT
 */


/* global angular */

(function() {
  'use strict';
  var availablePlugins, classFns, defaults, enabledPlugins, origModuleMethod, selectorControllerCount, utils,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  origModuleMethod = angular.module;

  angular.module = function(name, reqs, configFn) {

    /*
     * We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
     * as a requirement. We also need the module name to we can register our classy controllers.
     * Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
     */
    var module, plugin, pluginName, req, _i, _len;
    module = origModuleMethod(name, reqs, configFn);
    if (reqs) {
      for (_i = 0, _len = reqs.length; _i < _len; _i++) {
        req = reqs[_i];
        for (pluginName in availablePlugins) {
          plugin = availablePlugins[pluginName];
          if (pluginName === req) {
            enabledPlugins[pluginName] = plugin;
            if (plugin.options) {
              defaults.controller[plugin.name] = plugin.options;
            }
          }
        }
      }
      if (__indexOf.call(reqs, 'classy-core') >= 0 || __indexOf.call(reqs, 'classy') >= 0) {
        module.classy = {};
        module.classy.plugin = {
          controller: function(plugin) {
            return availablePlugins[name] = plugin;
          }
        };
        module.classy.options = {
          controller: {}
        };
        module.cC = module.classy.controller = function(classObj) {
          var classyController;
          return classyController = (function() {
            classFns.preInit(classyController, classObj, module);

            function classyController() {
              classFns.init(this, arguments, module);
            }

            return classyController;

          })();
        };
      }
    }
    return module;
  };

  defaults = {
    controller: {}
  };

  selectorControllerCount = 0;

  availablePlugins = {};

  enabledPlugins = {};

  utils = {
    extendDeep: function(dst) {
      var key, obj, value, _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        obj = arguments[_i];
        if (obj !== dst) {
          for (key in obj) {
            value = obj[key];
            if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
              this.extendDeep(dst[key], value);
            } else {
              dst[key] = value;
            }
          }
        }
      }
      return dst;
    }
  };

  classFns = {
    preInit: function(classConstructor, classObj, module) {
      var key, options, plugin, pluginName, value, _results;
      for (key in classObj) {
        if (!__hasProp.call(classObj, key)) continue;
        value = classObj[key];
        classConstructor.prototype[key] = value;
      }
      classConstructor.__options = options = extendDeep({}, defaults.controller, module.classy.options.controller, classObj.__options);
      _results = [];
      for (pluginName in enabledPlugins) {
        plugin = enabledPlugins[pluginName];
        if (options[plugin.name]) {
          plugin.options = options[plugin.name];
        }
        _results.push(typeof plugin.preInit === "function" ? plugin.preInit(classConstructor, classObj, module) : void 0);
      }
      return _results;
    },
    init: function(klass, $inject, module) {
      var deps, options, plugin, pluginName;
      options = klass.constructor.__options;
      deps = this.getDependencies(klass, $inject);
      for (pluginName in enabledPlugins) {
        plugin = enabledPlugins[pluginName];
        if (typeof plugin.init === "function") {
          plugin.init(klass, deps, module);
        }
      }
      return typeof klass.init === "function" ? klass.init() : void 0;
    },
    getDependencies: function(klass, $inject) {
      var deps, i, key, _i, _len, _ref;
      deps = {};
      _ref = klass.constructor.$inject;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        key = _ref[i];
        deps[key] = $inject[i];
      }
      return deps;
    }
  };

  angular.module('classy-core', []);

  angular.module('classy-registerSelector', ['classy-core']).classy.plugin.controller({
    name: 'register',
    preInit: function(classConstructor, classObj, module) {
      if (classObj.el || classObj.selector) {
        return this.registerSelector(module, classObj.el || classObj.selector, classConstructor);
      }
    },
    registerSelector: function(module, selector, classConstructor) {
      var controllerName, el, els, _i, _len, _results;
      selectorControllerCount++;
      controllerName = "ClassySelector" + selectorControllerCount + "Controller";
      module.controller(controllerName, classConstructor);
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
    }
  });

  angular.module('classy-register', ['classy-core']).classy.plugin.controller({
    name: 'registerSelector',
    preInit: function(classConstructor, classObj, module) {
      if (angular.isString(classObj.name)) {
        return module.controller(classObj.name, classConstructor);
      }
    }
  });

  angular.module('classy-bindDependencies', ['classy-core']).classy.plugin.controller({
    name: 'bindDependencies',
    options: {
      enabled: true,
      scopeShortcut: '$',
      useExistingNameString: '.'
    },
    preInit: function(classConstructor, classObj, module) {
      var deps;
      deps = classObj.inject;
      if (angular.isArray(deps)) {
        return this.inject(classConstructor, deps);
      } else if (angular.isObject(deps)) {
        return this.inject(classConstructor, [deps], classObj);
      }
    },
    inject: function(classConstructor, deps, classObj) {
      var injectObject, name, service;
      if (angular.isObject(deps[0])) {
        classConstructor.__classyControllerInjectObject = injectObject = deps[0];
        deps = (function() {
          var _results;
          _results = [];
          for (service in injectObject) {
            name = injectObject[service];
            _results.push(service);
          }
          return _results;
        })();
      }
      return classConstructor.$inject = deps;
    },
    init: function(klass, deps, module) {
      var dependency, i, injectName, injectObject, injectObjectMode, key, _i, _len, _ref, _results;
      if (this.options.enabled) {
        injectObject = klass.constructor.__classyControllerInjectObject;
        injectObjectMode = !!injectObject;
        _ref = klass.constructor.$inject;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          key = _ref[i];
          dependency = deps[key];
          if (injectObjectMode && (injectName = injectObject[key]) && injectName !== this.options.useExistingNameString) {
            _results.push(klass[injectName] = dependency);
          } else {
            klass[key] = dependency;
            if (key === '$scope' && this.options.scopeShortcut) {
              _results.push(klass[this.options.scopeShortcut] = klass[key]);
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      }
    }
  });

  angular.module('classy-addFnsToScope', ['classy-core']).classy.plugin.controller({
    name: 'addFnsToScope',
    options: {
      enabled: true,
      privateMethodPrefix: '_',
      ignore: ['constructor', 'init']
    },
    hasPrivateMethodPrefix: function(string) {
      var prefix;
      prefix = this.options.privateMethodPrefix;
      return string.slice(0, prefix.length) !== prefix;
    },
    init: function(klass, deps, module) {
      var fn, key, _ref, _results;
      if (this.options.enabled) {
        _ref = klass.constructor.prototype;
        _results = [];
        for (key in _ref) {
          fn = _ref[key];
          if (angular.isFunction(fn) && !(__indexOf.call(this.options.ignore, key) >= 0)) {
            klass[key] = angular.bind(klass, fn);
            if (this.hasPrivateMethodPrefix(key)) {
              _results.push(deps.$scope[key] = klass[key]);
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  });

  angular.module('classy-watch', ['classy-core']).classy.plugin.controller({
    name: 'watch',
    options: {
      enabled: true,
      _watchKeywords: {
        normal: [],
        objectEquality: ['{object}', '{deep}'],
        collection: ['{collection}', '{shallow}']
      }
    },
    isActive: function(klass, deps) {
      if (this.options.enabled && angular.isObject(klass.watch)) {
        if (!deps.$scope) {
          throw new Error("You need to inject `$scope` to use the watch object");
          return false;
        }
        return true;
      }
    },
    watchFns: {
      normal: function(klass, expression, fn, deps) {
        return deps.$scope.$watch(expression, angular.bind(klass, fn));
      },
      objectEquality: function(klass, expression, fn, deps) {
        return deps.$scope.$watch(expression, angular.bind(klass, fn), true);
      },
      collection: function(klass, expression, fn, deps) {
        return deps.$scope.$watchCollection(expression, angular.bind(klass, fn));
      }
    },
    init: function(klass, deps, module) {
      var expression, fn, keyword, watchFn, watchKeywords, watchRegistered, watchType, _i, _len, _ref, _ref1, _ref2, _results;
      if (!this.isActive(klass, deps)) {
        return;
      }
      watchKeywords = this.options._watchKeywords;
      _ref = klass.watch;
      _results = [];
      for (expression in _ref) {
        fn = _ref[expression];
        if (angular.isString(fn)) {
          fn = klass[fn];
        }
        if (angular.isString(expression) && angular.isFunction(fn)) {
          watchRegistered = false;
          _ref1 = this.watchFns;
          for (watchType in _ref1) {
            watchFn = _ref1[watchType];
            if (watchRegistered) {
              break;
            }
            _ref2 = watchKeywords[watchType];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              keyword = _ref2[_i];
              if (expression.indexOf(keyword) !== -1) {
                watchFn(klass, expression.replace(keyword, ''), fn, deps);
                watchRegistered = true;
                break;
              }
            }
          }
          if (!watchRegistered) {
            _results.push(this.watchFns.normal(klass, expression, fn, deps));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  });

  angular.module('classy', ['classy-bindDependencies', 'classy-addFnsToScope', 'classy-watch', 'classy-registerSelector', 'classy-register']);

}).call(this);
