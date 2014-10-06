angular.module('app', ['classy'])
  .classy.controllers([{
    name: 'BarController',
    inject: ['$scope'],
    init: function() {
      this.$.foo = 'bar';
    }
  }, {
    name: 'BazController',
    inject: ['$scope'],
    init: function() {
      this.$.foo = 'baz';
    }
  }])
  .service(
    // Service here
  )
  .config(
    // Config here
  );