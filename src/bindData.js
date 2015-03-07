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
    var dataProp = klass.constructor.prototype[this.options.keyName];
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
      for (var fnKey in data) {
        var fnValue = data[fnKey];
        if (this.options.addToClass) {
          klass[fnKey] = fnValue;
        }
        if (this.options.addToScope && !this.hasPrivatePrefix(fnKey) && deps.$scope) {
          deps.$scope[fnKey] = fnValue;
        }
      }
    }
  }
});
