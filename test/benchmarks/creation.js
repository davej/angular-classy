suite('Classy controller simple creation', function() {

  var app = angular.module('app', ['classy']);
  
  benchmark('Classy', function() {
    app.classy.controller({
      name: 'BenchmarkClassyController',
      inject: ['$scope']
    });
  });

  benchmark('Vanilla', function() {
    var benchmarkVanillaController = function($scope) {};
    app.controller('BenchmarkVanillaContoller', ['$scope', benchmarkVanillaController]);
  });
});
