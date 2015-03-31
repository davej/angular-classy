angular.module('classy.bindMethods', ['classy.core']).classy.plugin.component({
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

        if (angular.isFunction(method) && (this.options.ignore.indexOf(key) === -1)) {
          klass[key] = angular.bind(klass, method);
        }
      }
    }
  }
});
