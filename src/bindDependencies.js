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
      var preDeps = klass.constructor.__classDepNames;
      for (var i = 0; i < preDeps.length; ++i) {
        var key = preDeps[i];
        klass[key] = deps[key];
      }
    }
  }
});
