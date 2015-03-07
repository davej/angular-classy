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
