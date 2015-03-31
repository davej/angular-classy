/*global angular*/

var returnedClassyArrayModule = angular.module('array-classy', ['classy']).classy.components([{
	selector: 'hello',
	inject: ['$scope'],
	init: function() {
		this.foo = 'bar';
	}
}, {
	selector: 'goodbye',
	inject: ['$scope'],
	init: function() {
		this.foo = 'baz';
	}
}]);

var returnedClassyNormalModule = angular.module('normal-classy', ['classy']).classy.component({
	selector: 'hello',
	inject: ['$scope'],
	init: function() {
		this.foo = 'bar';
	}
});
