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
