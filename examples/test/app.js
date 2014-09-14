app = angular.module('app', ['classy']).classy.controllers([{
	name: 'hello',
	inject: ['$scope'],
	init: function() {
		this.$.foo = 'bar'
	}
}, {
	name: 'goodbye',
	inject: ['$scope'],
	init: function() {
		this.$.foo = 'baz'
	}
}])
console.log(app)