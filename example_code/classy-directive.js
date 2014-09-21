app.directive('classyDirective', function() {
  return {
    controller: app.classy.controller({
      inject: ['$scope'],
      init: function() {
        this.$.testing = 'worked';
      }
    })
  };
});