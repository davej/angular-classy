;(function() {
/*
Angular Classy 1.0.0
Dave Jeffery, @DaveJ
License: MIT
 */

/* global angular */
var availablePlugins = {};

var alreadyRegisteredModules = {};

var getActiveClassyPlugins = function(name, origModule) {
  // TODO: Write a test to ensure that this method gets called the correct amount of times

  var getNextRequires = function(name) {
    if (alreadyRegisteredModules[name]) {
      var module = angular.module(name);

      // for pluginName in module.requires
      for (var i = 0; i < module.requires.length; i++) {
        var pluginName = module.requires[i];
        var plugin = availablePlugins[pluginName];
        if (plugin) {
          obj[pluginName] = plugin;
          if (!plugin.name) {
            plugin.name = pluginName.replace('classy.', '');
          }
          if (origModule.__classyDefaults == null) {
            origModule.__classyDefaults = {};
          }
          origModule.__classyDefaults[plugin.name] = angular.copy(plugin.options || {});
        }
        getNextRequires(pluginName);
      }
    }
  };

  var obj = {};
  alreadyRegisteredModules[name] = true;
  getNextRequires(name);
  return obj;
};


/**
* Runs a particular stage of the lifecycle for all plugins.
* Also runs the `before` and `after` callbacks if specified.
*/
var pluginDo = function(methodName, params, callbacks) {
  var plugins = params[0].__plugins || params[0].prototype.__plugins;

  // for plugin of plugins
  var i, pluginKeys = Object.keys(plugins);
  for (i = 0; i < pluginKeys.length; i++) {
    var plugin = plugins[pluginKeys[i]];

    if (callbacks && typeof callbacks.before === 'function') {
      callbacks.before(plugin);
    }

    var returnVal;
    if (plugin && typeof plugin[methodName] === 'function') {
      returnVal = plugin[methodName].apply(plugin, params)
    }

    if (callbacks && typeof callbacks.after === 'function') {
      callbacks.after(plugin, returnVal);
    }
  }
};


/**
* Utility method to take an object and extend it with other objects
* It does this recursively (deep) on inner objects too.
*/
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

var origModuleMethod = angular.module;

angular.module = function(name, reqs, configFn) {
  /*
   * We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
   * as a requirement. We also need the module name to we can register our classy controllers.
   * Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
   */

  var module = origModuleMethod(name, reqs, configFn);

  if (reqs) {
    if (name === 'classy.core') {
      availablePlugins[name] = {};
    }

    var activeClassyPlugins = getActiveClassyPlugins(name, module);
    if (activeClassyPlugins['classy.core']) {
      module.classy = {
        plugin: {
          controller: function(plugin) { availablePlugins[name] = plugin; }
        },
        options: {
          controller: {}
        },
        activePlugins: activeClassyPlugins,
        controller: function(classObj) {
          var classyController;
          return classyController = (function() {
            /*
            * `classyController` contains only a set of proxy functions for `classFns`,
            * this is because I suspect that performance is better this way.
            * TODO: Test performance to see if this is the most performant way to do it.
            */

            // Pre-initialisation (before instance is created)
            classFns.preInit(classyController, classObj, module);

            function classyController() {
              // Initialisation (after instance is created)
              classFns.init(this, arguments, module);
            }

            return classyController;
          })();
        },
        /**
         * Accepts an array of controllers and returns the module, e.g.:
         * `module.classy.controllers([xxx, xxx]).config(xxx).run(xxx)`
         * Requested in issue #29
         */
        controllers: function(controllerArray) {
          // for classObj in controllerArray
          for (var i = 0; i < controllerArray.length; i++) {
            this.controller(controllerArray[i]);
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


var classFns = {

  localInject: ['$q'],

  preInit: function(classConstructor, classObj, module) {
    /**
     * Add properties from class object onto the class constructor
     */
    // for key of classObj
    var classKeys = Object.keys(classObj);
    for (var i = 0; i < classKeys.length; i++) {
      var key = classKeys[i];
      if (!classObj.hasOwnProperty(key)) continue;
      classConstructor.prototype[key] = classObj[key];
    }

    // TODO: Make this a function
    // Build Classy Options ...
    var options = copyAndExtendDeep({}, module.__classyDefaults, module.classy.options.controller, classObj.__options);
    var shorthandOptions = {};

    // for optionsName, option in options
    var optionNames = Object.keys(options);
    for (var j = 0; j < optionNames.length; j++) {
      var optionName = optionNames[j];
      var option = options[optionName];
      if (!angular.isObject(option)) {
        shorthandOptions[optionName] = option;
      }
    }

    classConstructor.prototype.__plugins = {};

    // for pluginName, plugin of module.classy.activePlugins
    var pluginNames = Object.keys(module.classy.activePlugins);
    for (var k = 0; k < pluginNames.length; k++) {
      var pluginName = pluginNames[k];
      var plugin = module.classy.activePlugins[pluginName];
      classConstructor.prototype.__plugins[pluginName] = angular.copy(plugin);
      classConstructor.prototype.__plugins[pluginName].classyOptions = options;
      classConstructor.prototype.__plugins[pluginName].options = angular.extend(options[plugin.name] || {}, shorthandOptions);
    }
    // ... End Build Classy Options

    pluginDo('preInitBefore', [classConstructor, classObj, module]);
    pluginDo('preInit', [classConstructor, classObj, module]);
    pluginDo('preInitAfter', [classConstructor, classObj, module]);
  },

  init: function(klass, $inject, module) {
    var injectIndex = 0;
    var deps = {};

    // for key in klass.constructor.__classDepNames
    for (var i = 0; i < klass.constructor.__classDepNames.length; i++) {
      var key = klass.constructor.__classDepNames[i];
      deps[key] = $inject[injectIndex];
      injectIndex++;
    }
    pluginDo('null', [klass], {
      before: function(plugin) {
        if (angular.isArray(plugin.localInject)) {
          // for depName in plugin.localInject
          for (var j = 0; j < plugin.localInject.length; j++) {
            var depName = plugin.localInject[j];
            plugin[depName] = $inject[injectIndex];
            injectIndex++;
          }
        }
      }
    });

    // for depName in @localInject
    for (var j = 0; j < this.localInject.length; j++) {
      var depName = this.localInject[j];
      var dep = $inject[injectIndex];
      this[depName] = dep;
      injectIndex++;
    }
    pluginDo('initBefore', [klass, deps, module]);
    var pluginPromises = [];
    pluginDo('init', [klass, deps, module], {
      after: function(plugin, returnVal) {
        if (returnVal && returnVal.then) {
          // Naively assume this is a promise
          pluginPromises.push(returnVal);
        }
      }
    });
    var initClass = function() {
      if (typeof klass.init === "function") {
        klass.init();
      }
      pluginDo('initAfter', [klass, deps, module]);
      this.postInit(klass, deps, module);
    };
    if (pluginPromises.length) {
      this.$q.all(pluginPromises).then(angular.bind(this, initClass));
    } else {
      angular.bind(this, initClass)();
    }
  },
  postInit: function(klass, deps, module) {
    pluginDo('postInitBefore', [klass, deps, module]);
    pluginDo('postInit', [klass, deps, module]);
    pluginDo('postInitAfter', [klass, deps, module]);
  }
};

angular.module('classy.core', []);

angular.module('classy.bindData', ['classy.core']).classy.plugin.controller({
  localInject: ['$parse'],
  options: {
    enabled: true,
    addToScope: true,
    addToClass: true,
    privatePrefix: '_',
    keyName: 'data'
  },
  hasPrivatePrefix: function(string) {
    var prefix = this.options.privatePrefix;
    if (!prefix) {
      return false;
    } else {
      return string.slice(0, prefix.length) === prefix;
    }
  },
  init: function(klass, deps, module) {
    // Adds objects returned by or set to the `$scope`
    var dataProp = klass.constructor.prototype[this.options.keyName]
    if (this.options.enabled && dataProp) {
      var data = angular.copy(dataProp);
      if (angular.isFunction(data)) {
        data = data.call(klass);
      } else if (angular.isObject(data)) {
        for (var key in data) {
          var value = data[key];
          if (angular.isString(value)) {
            var getter = this.$parse(value);
            data[key] = getter(klass);
          } else {
            data[key] = value;
          }
        }
      }
      for (var key in data) {
        var value = data[key];
        if (this.options.addToClass) {
          klass[key] = value;
        }
        if (this.options.addToScope && !this.hasPrivatePrefix(key) && deps.$scope) {
          deps.$scope[key] = value;
        }
      }
    }
  }
});

angular.module('classy.bindDependencies', ['classy.core']).classy.plugin.controller({
  options: {
    enabled: true,
    scopeShortcut: '$'
  },
  preInit: function(classConstructor, classObj, module) {
    var depNames = classObj.inject || [];
    if (angular.isArray(depNames)) {
      this.inject(classConstructor, depNames, module);
    }
  },
  inject: function(classConstructor, depNames, module) {
    var pluginDepNames = [];
    for (var pluginName in module.classy.activePlugins) {
      var plugin = module.classy.activePlugins[pluginName];
      if (angular.isArray(plugin.localInject)) {
        pluginDepNames = pluginDepNames.concat(plugin.localInject);
      }
    }
    pluginDepNames = pluginDepNames.concat(classFns.localInject);
    classConstructor.__classDepNames = angular.copy(depNames);
    classConstructor.$inject = depNames.concat(pluginDepNames);
  },
  initBefore: function(klass, deps, module) {
    if (this.options.enabled) {
      var preDeps = klass.constructor.$inject;
      for (var i = 0; i < preDeps.length; ++i) {
        var key = preDeps[i];
        klass[key] = deps[key];
        if (key === '$scope' && this.options.scopeShortcut) {
          klass[this.options.scopeShortcut] = klass[key];
        }
      }
    }
  }
});

angular.module('classy.bindMethods', ['classy.core']).classy.plugin.controller({
  localInject: ['$parse'],
  options: {
    enabled: true,
    addToScope: true,
    addToClass: true,
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
  init: function(klass, deps, module) {
    // indexOf shim for IE <= 8
    var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (this.options.enabled) {
      var methods = klass.constructor.prototype[this.options.keyName];
      for (var key in methods) {
        var method = methods[key];

        var boundMethod;
        if (angular.isFunction(method) && !(__indexOf.call(this.options.ignore, key) >= 0)) {
          boundMethod = angular.bind(klass, method);
        } else if (angular.isString(method)) {
          var getter = this.$parse(method);
          boundMethod = function() {
            return getter(klass);
          };
        }
        if (angular.isFunction(boundMethod)) {
          if (this.options.addToClass) {
            klass[key] = boundMethod;
          }
          if (this.options.addToScope && !this.hasPrivatePrefix(key) && deps.$scope) {
            deps.$scope[key] = boundMethod;
          }
        }
      }
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
      module.controller(classObj[this.options.key], classConstructor);
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
    if (!this.isActive(klass, deps)) {
      return;
    }
    var watchKeywords = this.options._watchKeywords;

    // for expression, fn of klass.watch
    for (var expression in klass.watch) {
      var fn = klass.watch[expression];
      if (angular.isString(fn)) {
        fn = klass[fn];
      }
      if (angular.isString(expression) && angular.isFunction(fn)) {
        var watchRegistered = false;

        // Search for keywords that identify it is a non-standard watch
        // for watchType, watchFn of @watchFns
        for (var watchType in this.watchFns) {
          var watchFn = this.watchFns[watchType];
          if (watchRegistered) {
            break;
          }
          // for keyword in watchKeywords[watchType]
          var keywords = watchKeywords[watchType];
          for (var i = 0; i < keywords.length; i++) {
            var keyword = keywords[i];
            if (expression.indexOf(keyword) !== -1) {
              watchFn(klass, expression.replace(keyword, ''), fn, deps);
              watchRegistered = true;
              break;
            }
          }
        }
        if (!watchRegistered) {
          // If no keywords have been found then register it as a normal watch
          this.watchFns.normal(klass, expression, fn, deps);
        }
      }
    }
  }
});

angular.module('classy', ["classy.bindData","classy.bindDependencies","classy.bindMethods","classy.core","classy.register","classy.watch"]);
})();