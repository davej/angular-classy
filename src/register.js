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
