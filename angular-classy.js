
/*
Angular Classy 0.4.1
Dave Jeffery, @DaveJ
License: MIT
 */


/* global angular */

(function() {
  'use strict';
  var availablePlugins, classFns, copyAndExtendDeep, defaults, enablePlugins, enabledPlugins, origModuleMethod, pluginDo, selectorControllerCount,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  defaults = {
    controller: {}
  };

  selectorControllerCount = 0;

  availablePlugins = {};

  enabledPlugins = {};

  enablePlugins = function(reqs) {
    var plugin, pluginName, req, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = reqs.length; _i < _len; _i++) {
      req = reqs[_i];
      _results.push((function() {
        var _results1;
        _results1 = [];
        for (pluginName in availablePlugins) {
          plugin = availablePlugins[pluginName];
          if (pluginName === req) {
            enabledPlugins[pluginName] = plugin;
            if (plugin.options) {
              _results1.push(defaults.controller[plugin.name] = angular.copy(plugin.options));
            } else {
              _results1.push(void 0);
            }
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  };

  pluginDo = function(methodName, params, obj) {
    var plugin, pluginName, returnVal, _ref, _results;
    _results = [];
    for (pluginName in enabledPlugins) {
      plugin = enabledPlugins[pluginName];
      if (obj != null) {
        if (typeof obj.before === "function") {
          obj.before(plugin);
        }
      }
      returnVal = (_ref = plugin[methodName]) != null ? _ref.apply(plugin, params) : void 0;
      _results.push(obj != null ? typeof obj.after === "function" ? obj.after(plugin, returnVal) : void 0 : void 0);
    }
    return _results;
  };

  copyAndExtendDeep = function(dst) {
    var key, obj, value, _i, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      obj = arguments[_i];
      if (obj !== dst) {
        for (key in obj) {
          value = obj[key];
          if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
            copyAndExtendDeep(dst[key], value);
          } else {
            dst[key] = angular.copy(value);
          }
        }
      }
    }
    return dst;
  };

  origModuleMethod = angular.module;

  angular.module = function(name, reqs, configFn) {

    /*
     * We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
     * as a requirement. We also need the module name to we can register our classy controllers.
     * Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
     */
    var module;
    module = origModuleMethod(name, reqs, configFn);
    if (reqs) {
      enablePlugins(reqs);
      if (__indexOf.call(reqs, 'classy-core') >= 0 || __indexOf.call(reqs, 'classy') >= 0) {
        module.classy = {
          plugin: {
            controller: function(plugin) {
              return availablePlugins[name] = plugin;
            }
          },
          options: {
            controller: {}
          },
          controller: function(classObj) {
            var classyController;
            return classyController = (function() {
              classFns.preInit(classyController, classObj, module);

              function classyController() {
                classFns.init(this, arguments, module);
              }

              return classyController;

            })();
          }
        };
        module.cC = module.classy.controller;
      }
    }
    return module;
  };

  classFns = {
    localInject: ['$q'],
    preInit: function(classConstructor, classObj, module) {
      var key, options, value;
      for (key in classObj) {
        if (!__hasProp.call(classObj, key)) continue;
        value = classObj[key];
        classConstructor.prototype[key] = value;
      }
      options = copyAndExtendDeep({}, defaults.controller, module.classy.options.controller, classObj.__options);
      pluginDo('preInitBefore', [classConstructor, classObj, module], {
        before: function(plugin) {
          return plugin.options = options[plugin.name] || {};
        }
      });
      pluginDo('preInit', [classConstructor, classObj, module]);
      return pluginDo('preInitAfter', [classConstructor, classObj, module]);
    },
    init: function(klass, $inject, module) {
      var dep, depName, deps, initClass, injectIndex, key, pluginPromises, _i, _j, _len, _len1, _ref, _ref1;
      injectIndex = 0;
      deps = {};
      _ref = klass.constructor.__classDepNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        deps[key] = $inject[injectIndex];
        injectIndex++;
      }
      pluginDo('null', [], {
        before: function(plugin) {
          var dep, depName, _j, _len1, _ref1, _results;
          if (angular.isArray(plugin.localInject)) {
            _ref1 = plugin.localInject;
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              depName = _ref1[_j];
              dep = $inject[injectIndex];
              plugin[depName] = dep;
              _results.push(injectIndex++);
            }
            return _results;
          }
        }
      });
      _ref1 = this.localInject;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        depName = _ref1[_j];
        dep = $inject[injectIndex];
        this[depName] = dep;
        injectIndex++;
      }
      pluginDo('initBefore', [klass, deps, module]);
      pluginPromises = [];
      pluginDo('init', [klass, deps, module], {
        after: function(plugin, returnVal) {
          if (returnVal && returnVal.then) {
            return pluginPromises.push(returnVal);
          }
        }
      });
      initClass = function() {
        if (typeof klass.init === "function") {
          klass.init();
        }
        pluginDo('initAfter', [klass, deps, module]);
        return this.postInit(klass, deps, module);
      };
      if (pluginPromises.length) {
        return this.$q.all(pluginPromises).then(angular.bind(this, initClass));
      } else {
        return angular.bind(this, initClass)();
      }
    },
    postInit: function(klass, deps, module) {
      pluginDo('postInitBefore', [klass, deps, module]);
      pluginDo('postInit', [klass, deps, module]);
      return pluginDo('postInitAfter', [klass, deps, module]);
    }
  };

  angular.module('classy-core', []);

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
      if (!prefix) {
        return false;
      } else {
        return string.slice(0, prefix.length) === prefix;
      }
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
            if (!this.hasPrivateMethodPrefix(key) && deps.$scope) {
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

  angular.module('classy-bindDependencies', ['classy-core']).classy.plugin.controller({
    name: 'bindDependencies',
    options: {
      enabled: true,
      scopeShortcut: '$',
      useExistingNameString: '.'
    },
    preInit: function(classConstructor, classObj, module) {
      var depNames;
      depNames = classObj.inject || [];
      if (angular.isArray(depNames)) {
        return this.inject(classConstructor, depNames);
      } else if (angular.isObject(depNames)) {
        return this.inject(classConstructor, [depNames], classObj);
      }
    },
    inject: function(classConstructor, depNames, classObj) {
      var name, plugin, pluginDepNames, pluginName, service;
      if (angular.isObject(depNames[0])) {
        classConstructor.__classyControllerInjectObject = depNames[0];
        depNames = (function() {
          var _ref, _results;
          _ref = depNames[0];
          _results = [];
          for (service in _ref) {
            name = _ref[service];
            _results.push(service);
          }
          return _results;
        })();
      }
      pluginDepNames = [];
      for (pluginName in enabledPlugins) {
        plugin = enabledPlugins[pluginName];
        if (angular.isArray(plugin.localInject)) {
          pluginDepNames = pluginDepNames.concat(plugin.localInject);
        }
      }
      pluginDepNames = pluginDepNames.concat(classFns.localInject);
      classConstructor.__classDepNames = angular.copy(depNames);
      return classConstructor.$inject = depNames.concat(pluginDepNames);
    },
    init: function(klass, deps, module) {
      var dependency, i, injectName, injectObject, key, _i, _len, _ref, _results;
      if (this.options.enabled) {
        injectObject = klass.constructor.__classyControllerInjectObject;
        _ref = klass.constructor.$inject;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          key = _ref[i];
          dependency = deps[key];
          if (injectObject && (injectName = injectObject[key]) && injectName !== this.options.useExistingNameString) {
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

  angular.module('classy-register', ['classy-core']).classy.plugin.controller({
    name: 'registerSelector',
    preInit: function(classConstructor, classObj, module) {
      if (angular.isString(classObj.name)) {
        return module.controller(classObj.name, classConstructor);
      }
    }
  });

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
    postInit: function(klass, deps, module) {
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

  angular.module('classy', ["classy-addFnsToScope", "classy-bindDependencies", "classy-register", "classy-registerSelector", "classy-watch"]);

}).call(this);
