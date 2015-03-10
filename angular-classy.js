;(function() {
/*
Angular Classy 1.1.0
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
          if (!origModule.__classyDefaults) {
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
  // params = [klass, deps, module];

  var plugins = params[2].classy.activePlugins;
  var options = params[0].__options || params[0].prototype.__options;

  // for plugin of plugins
  var pluginKeys = Object.keys(plugins);
  for (var i = 0; i < pluginKeys.length; i++) {
    var plugin = plugins[pluginKeys[i]];
    plugin.options = options[plugin.name] || {};
    plugin.classyOptions = options;

    if (callbacks && angular.isFunction(callbacks.before)) {
      callbacks.before(plugin);
    }

    var returnVal;
    if (plugin && methodName && angular.isFunction(plugin[methodName])) {
      returnVal = plugin[methodName].apply(plugin, params);
    }

    if (callbacks && angular.isFunction(callbacks.after)) {
      callbacks.after(plugin, returnVal);
    }
  }
};


/**
* Utility method to take an object and extend it with other objects
* It does this recursively (deep) on inner objects too.
*/
var copyAndExtendDeep = function(dst) {
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
          component: function(plugin) { availablePlugins[name] = plugin; }
        },
        options: {
          component: {}
        },
        activePlugins: activeClassyPlugins,
        component: function(classObj) {
            /*
            * `classyController` contains only a set of proxy functions for `classFns`,
            * this is because I suspect that performance is better this way.
            * TODO: Test performance to see if this is the most performant way to do it.
            */

            // Pre-initialisation (before instance is created)
            classFns.preInit(classyComponent, classObj, module);

            function classyComponent() {
              // Initialisation (after instance is created)
              classFns.init(this, arguments, module);
            }

            return classyComponent;
        },
        /**
         * Accepts an array of controllers and returns the module, e.g.:
         * `module.classy.controllers([xxx, xxx]).config(xxx).run(xxx)`
         * Requested in issue #29
         */
         components: function(controllerArray) {
          // for classObj in controllerArray
          for (var i = 0; i < controllerArray.length; i++) {
            this.component(controllerArray[i]);
          }

          return module;
        }
      };
      module.cC = module.classy.component;
      module.cCs = module.classy.components;
    }
  }
  return module;
};


var classFns = {

  localInject: ['$q'],

  preInit: function(classConstructor, classObj, module) {
    this.buildConstructor(classConstructor, classObj);
    this.buildOptions(classConstructor, classObj, module);

    pluginDo('preInitBefore', [classConstructor, classObj, module]);
    pluginDo('preInit', [classConstructor, classObj, module]);
    pluginDo('preInitAfter', [classConstructor, classObj, module]);
  },

  /**
   * Add properties from class object onto the class constructor
   */
  buildConstructor: function(classConstructor, classObj) {
    // for key of classObj
    var classKeys = Object.keys(classObj);
    for (var i = 0; i < classKeys.length; i++) {
      var key = classKeys[i];
      if (!classObj.hasOwnProperty(key)) continue;
      classConstructor.prototype[key] = classObj[key];
    }
  },

  /**
   * Build options object for all classy plugins
   */
  buildOptions: function(classConstructor, classObj, module) {
    var options = copyAndExtendDeep({}, module.__classyDefaults, module.classy.options.component, classObj.__options);
    var shorthandOptions = {};

    // Collect shorthand options
    var option, optionName;
    var optionNames = Object.keys(options);
    for (var j = 0; j < optionNames.length; j++) {
      optionName = optionNames[j];
      option = options[optionNames[j]];
      if (!angular.isObject(option)) {
        shorthandOptions[optionName] = option;
      }
    }

    // Apply shorthand options to plugin options
    if (Object.keys(shorthandOptions).length) {
      for (var k = 0; k < optionNames.length; k++) {
        optionName = optionNames[k];
        option = options[optionNames[k]];
        if (angular.isObject(option)) {
          angular.extend(option, shorthandOptions);
        }
      }
    }

    classConstructor.prototype.__options = options;
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
    pluginDo(null, [klass, deps, module], {
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
      if (angular.isFunction(klass.init)) {
        klass.init();
      }
      pluginDo('initAfter', [klass, deps, module]);
      this.postInit(klass, deps, module);
    };
    var boundClass = angular.bind(this, initClass);
    if (pluginPromises.length) {
      // Injected dependency below is $q
      $inject[injectIndex].all(pluginPromises).then(boundClass);
    } else {
      boundClass();
    }
  },
  postInit: function(klass, deps, module) {
    pluginDo('postInitBefore', [klass, deps, module]);
    pluginDo('postInit', [klass, deps, module]);
    pluginDo('postInitAfter', [klass, deps, module]);
  }
};

angular.module('classy.core', []);

angular.module('classy.bindDependencies', ['classy.core']).classy.plugin.component({
  options: {
    enabled: true
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
      }
    }
  }
});

angular.module('classy.bindMethods', ['classy.core']).classy.plugin.component({
  localInject: ['$parse'],
  options: {
    enabled: true,
    ignore: ['constructor', 'init'],
    keyName: 'methods'
  },
  init: function(klass, deps, module) {
    if (this.options.enabled) {
      var methods = klass.constructor.prototype[this.options.keyName];
      for (var key in methods) {
        var method = methods[key];

        var boundMethod;
        if (angular.isFunction(method) && (this.options.ignore.indexOf(key) === -1)) {
          boundMethod = angular.bind(klass, method);
        } else if (angular.isString(method)) {
          var getter = this.$parse(method);
          boundMethod = function() {
            return getter(klass);
          };
        }
        if (angular.isFunction(boundMethod)) {
          klass[key] = boundMethod;
        }
      }
    }
  }
});

angular.module('classy.data', ['classy.core']).classy.plugin.component({
  options: {
    enabled: true,
    keyName: 'data'
  },
  preInitBefore: function(classConstructor, classObj) {
    if (this.isActive(classObj)) {
      this.localInject = ['$parse'];
    }
  },
  getDataProp: function(proto) {
    return proto[this.options.keyName];
  },
  isActive: function(proto) {
    return !!(this.options.enabled && this.getDataProp(proto));
  },
  init: function(klass, deps, module) {
    var proto = klass.constructor.prototype;
    if (this.isActive(proto)) {
      var data = angular.copy(this.getDataProp(proto));
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
      for (var fnKey in data) {
        klass[fnKey] = data[fnKey];
      }
    }
  }
});

angular.module('classy.observe', ['classy.core']).classy.plugin.component({
  options: {
    enabled: true,
    key: 'observe',
    _watchKeywords: {
      normal: [],
      object: ['{object}', '{deep}'],
      collection: ['{collection}', '{shallow}']
    }
  },
  isActive: function(klass) {
    if (this.options.enabled && angular.isObject(klass[this.options.key])) {
      return true;
    } else {
      return false;
    }
  },
  preInitBefore: function(classConstructor, classObj) {
    if (this.isActive(classObj)) {
      this.localInject = ['$scope'];
    }
  },
  watchFns: {
    normal: function(scope, expression, fn) {
      return scope.$watch(expression, fn);
    },
    object: function(scope, expression, fn) {
      return scope.$watch(expression, fn, true);
    },
    collection: function(scope, expression, fn) {
      return scope.$watchCollection(expression, fn);
    }
  },
  postInit: function(klass, deps, module) {
    if (!this.isActive(klass, deps)) {
      return;
    }

    var klassName = Object.getPrototypeOf(klass).name;
    var watchKeywords = this.options._watchKeywords;
    var observations = klass[this.options.key];

    // for expression, fn of klass.watch
    for (var expression in observations) {
      var fn = observations[expression];
      if (angular.isString(fn)) {
        fn = klass[fn];
      }
      if (angular.isString(expression) && angular.isFunction(fn)) {
        var observerRegistered = false;
        var targetFn = angular.bind(klass, fn);

        // Search for keywords that identify it as a non-standard watch
        // for watchType, watchFn of @watchFns
        for (var watchType in this.watchFns) {
          if (observerRegistered) {
            break;
          }
          // for keyword in watchKeywords[watchType]
          var keywords = watchKeywords[watchType];
          for (var i = 0; i < keywords.length; i++) {
            var keyword = keywords[i];
            if (expression.indexOf(keyword) !== -1) {
              var watchFn = this.watchFns[watchType];

              expression = klassName + '.' + expression.replace(keyword, '');
              watchFn(this.$scope, expression, targetFn);
              observerRegistered = true;
              break;
            }
          }
        }
        if (!observerRegistered) {
          // If no keywords have been found then register it as a normal watch
          this.watchFns.normal(this.$scope, klassName + '.' + expression, targetFn);
        }
      }
    }
  }
});

angular.module('classy.register', ['classy.core']).classy.plugin.component({
  options: {
    enabled: true,
    key: 'selector'
  },
  toCamelCase: function(str) {
    return str.replace(/-(\w)/g, function(match) {
      return match[1].toUpperCase();
    });
  },
  preInit: function(classConstructor, classObj, module) {
    if (this.options.enabled && angular.isString(classObj[this.options.key])) {
      var dasherizedName = this.toCamelCase(classObj[this.options.key]);
      
      var proto = classConstructor.prototype;
      if (!proto.name) {
        proto.name = dasherizedName;
      }

      var bindToController = {};
      for (var i = 0; i < classObj.bind; i++) {
        var bind = classObj.bind[i];
        bindToController[bind] = '@';
      }

      var directive = {
        scope: {},
        // replace: true,
        restrict: 'E', // support [attr] etc..
        controller: classConstructor,
        controllerAs: proto.name,
        bindToController: bindToController
      };

      if (classObj.templateUrl) {
        directive.templateUrl = classObj.templateUrl;
      }
      if (classObj.template) {
        directive.template = classObj.template;
      }
      module.directive(dasherizedName, function() {
        return directive;
      });
    }
  }
});

angular.module('classy', ["classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register","classy.bindDependencies","classy.bindMethods","classy.core","classy.data","classy.observe","classy.register"]);
})();