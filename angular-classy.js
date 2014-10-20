
/*
Angular Classy 1.0.0
Dave Jeffery, @DaveJ
License: MIT
 */


/* global angular */

(function() {
  'use strict';
  var availablePlugins, classFns, copyAndExtendDeep, getActiveClassyPlugins, origModuleMethod, pluginDo,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  availablePlugins = {};

  getActiveClassyPlugins = function(name, origModule) {
    var getNextRequires, obj;
    obj = {};
    (getNextRequires = function(name) {
      var module, plugin, pluginName, _i, _len, _ref, _results;
      module = angular.module(name);
      _ref = module.requires;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pluginName = _ref[_i];
        plugin = availablePlugins[pluginName];
        if (plugin) {
          obj[pluginName] = plugin;
          if (plugin.name == null) {
            plugin.name = pluginName.replace('classy.', '');
          }
          if (origModule.__classyPluginDefaults == null) {
            origModule.__classyPluginDefaults = {};
          }
          origModule.__classyPluginDefaults[plugin.name] = angular.copy(plugin.options || {});
        }
        _results.push(getNextRequires(pluginName));
      }
      return _results;
    })(name);
    return obj;
  };

  pluginDo = function(methodName, params, obj) {
    var plugin, pluginName, plugins, returnVal, _ref, _results;
    plugins = params[0].__plugins || params[0].prototype.__plugins;
    _results = [];
    for (pluginName in plugins) {
      plugin = plugins[pluginName];
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
    var activeClassyPlugins, module;
    module = origModuleMethod(name, reqs, configFn);
    if (reqs) {
      if (name === 'classy.core') {
        availablePlugins[name] = {};
      }
      activeClassyPlugins = getActiveClassyPlugins(name, module);
      if (activeClassyPlugins['classy.core']) {
        module.classy = {
          plugin: {
            controller: function(plugin) {
              return availablePlugins[name] = plugin;
            }
          },
          options: {
            controller: {}
          },
          activePlugins: activeClassyPlugins,
          controller: function(classObj) {
            var classyController;
            return classyController = (function() {
              classFns.preInit(classyController, classObj, module);

              function classyController() {
                classFns.init(this, arguments, module);
              }

              return classyController;

            })();
          },
          controllers: function(controllerArray) {
            var classObj, _i, _len;
            for (_i = 0, _len = controllerArray.length; _i < _len; _i++) {
              classObj = controllerArray[_i];
              this.controller(classObj);
            }
            return module;
          }
        };
        module.cC = module.classy.controller;
        module.cCs = module.classy.controllers;
      }
    }
    return module;
  };

  classFns = {
    localInject: ['$q'],
    preInit: function(classConstructor, classObj, module) {
      var key, options, plugin, pluginName, value, _ref;
      for (key in classObj) {
        if (!__hasProp.call(classObj, key)) continue;
        value = classObj[key];
        classConstructor.prototype[key] = value;
      }
      options = copyAndExtendDeep({}, module.__classyPluginDefaults, module.classy.options.controller, classObj.__options);
      classConstructor.prototype.__plugins = {};
      _ref = module.classy.activePlugins;
      for (pluginName in _ref) {
        plugin = _ref[pluginName];
        classConstructor.prototype.__plugins[pluginName] = angular.copy(plugin);
        classConstructor.prototype.__plugins[pluginName].classyOptions = options;
        classConstructor.prototype.__plugins[pluginName].options = options[plugin.name] || {};
      }
      pluginDo('preInitBefore', [classConstructor, classObj, module]);
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
      pluginDo('null', [klass], {
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
          if (returnVal != null ? returnVal.then : void 0) {
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

  angular.module('classy.core', []);

  angular.module('classy.bindData', ['classy.core']).classy.plugin.controller({
    localInject: ['$parse'],
    options: {
      enabled: true,
      addToScope: true,
      privatePrefix: '_',
      keyName: 'data'
    },
    hasPrivatePrefix: function(string) {
      var prefix;
      prefix = this.options.privatePrefix;
      if (!prefix) {
        return false;
      } else {
        return string.slice(0, prefix.length) === prefix;
      }
    },
    init: function(klass, deps, module) {
      var data, getter, key, value, _results;
      if (this.options.enabled && klass.constructor.prototype[this.options.keyName]) {
        data = angular.copy(klass.constructor.prototype[this.options.keyName]);
        if (angular.isFunction(data)) {
          data = data.call(klass);
        } else if (angular.isObject(data)) {
          for (key in data) {
            value = data[key];
            if (typeof value === 'string') {
              getter = this.$parse(value);
              data[key] = getter(klass);
            } else {
              data[key] = value;
            }
          }
        }
        _results = [];
        for (key in data) {
          value = data[key];
          klass[key] = value;
          if (this.options.addToScope && !this.hasPrivatePrefix(key) && deps.$scope) {
            _results.push(deps.$scope[key] = klass[key]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  });

  angular.module('classy.bindDependencies', ['classy.core']).classy.plugin.controller({
    options: {
      enabled: true,
      scopeShortcut: '$'
    },
    preInit: function(classConstructor, classObj, module) {
      var depNames;
      depNames = classObj.inject || [];
      if (angular.isArray(depNames)) {
        return this.inject(classConstructor, depNames, module);
      }
    },
    inject: function(classConstructor, depNames, module) {
      var plugin, pluginDepNames, pluginName, _ref;
      pluginDepNames = [];
      _ref = module.classy.activePlugins;
      for (pluginName in _ref) {
        plugin = _ref[pluginName];
        if (angular.isArray(plugin.localInject)) {
          pluginDepNames = pluginDepNames.concat(plugin.localInject);
        }
      }
      pluginDepNames = pluginDepNames.concat(classFns.localInject);
      classConstructor.__classDepNames = angular.copy(depNames);
      return classConstructor.$inject = depNames.concat(pluginDepNames);
    },
    initBefore: function(klass, deps, module) {
      var i, key, _i, _len, _ref, _results;
      if (this.options.enabled) {
        _ref = klass.constructor.$inject;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          key = _ref[i];
          klass[key] = deps[key];
          if (key === '$scope' && this.options.scopeShortcut) {
            _results.push(klass[this.options.scopeShortcut] = klass[key]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  });

  angular.module('classy.bindMethods', ['classy.core']).classy.plugin.controller({
    options: {
      enabled: true,
      addToScope: true,
      privatePrefix: '_',
      ignore: ['constructor', 'init'],
      keyName: 'methods'
    },
    hasPrivatePrefix: function(string) {
      var prefix;
      prefix = this.options.privatePrefix;
      if (!prefix) {
        return false;
      } else {
        return string.slice(0, prefix.length) === prefix;
      }
    },
    initBefore: function(klass, deps, module) {
      var fn, key, _ref, _results;
      if (this.options.enabled) {
        _ref = klass.constructor.prototype[this.options.keyName];
        _results = [];
        for (key in _ref) {
          fn = _ref[key];
          if (angular.isFunction(fn) && !(__indexOf.call(this.options.ignore, key) >= 0)) {
            klass[key] = angular.bind(klass, fn);
            if (this.options.addToScope && !this.hasPrivatePrefix(key) && deps.$scope) {
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

  angular.module('classy.register', ['classy.core']).classy.plugin.controller({
    options: {
      enabled: true,
      key: 'name'
    },
    preInit: function(classConstructor, classObj, module) {
      if (this.options.enabled && angular.isString(classObj[this.options.key])) {
        return module.controller(classObj[this.options.key], classConstructor);
      }
    }
  });

  angular.module('classy.watch', ['classy.core']).classy.plugin.controller({
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

  angular.module('classy', ["classy.bindData", "classy.bindDependencies", "classy.bindMethods", "classy.core", "classy.register", "classy.watch"]);

}).call(this);
