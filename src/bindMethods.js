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
