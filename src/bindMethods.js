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
