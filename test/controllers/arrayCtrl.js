/*global angular*/

var returnedClassyArrayModule = angular.module('array-classy', ['classy']).classy.controllers([{
	name: 'hello',
	inject: ['$scope'],
	init: function() {
		this.$.foo = 'bar';
	}
}, {
	name: 'goodbye',
	inject: ['$scope'],
	init: function() {
		this.$.foo = 'baz';
	}
}]);
