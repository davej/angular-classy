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
