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
