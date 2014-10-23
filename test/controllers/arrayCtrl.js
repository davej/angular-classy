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

var returnedClassyNormalModule = angular.module('normal-classy', ['classy']).classy.controller({
	name: 'hello',
	inject: ['$scope'],
	init: function() {
		this.$.foo = 'bar';
	}
});
