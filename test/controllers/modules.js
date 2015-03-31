/*global angular*/
'use strict';
var testFooVar;
var testBarVar;
(function () {

	angular.module('app2', ['classy']);
	angular.module('app1', []);
	angular.module('app3', ['classy.core']);
	angular.module('app4', ['app2']);

	angular.module('classy.foo', ['classy.core']).classy.plugin.component({
		name: 'foo',

		options: {
			foo: 'boo'
		},

		preInit: function () {
			testFooVar = this.options.foo;
		}
	});

	angular.module('classy.bar', ['classy.core']).classy.plugin.component({
		name: 'bar',

		options: {
			bar: 'baz'
		},

		preInitBefore: function () {
			this.classyOptions.foo.foo = this.options.bar;
			testBarVar = this.options.bar;
		}
	});

	angular.module('app5', ['classy.core', 'classy.foo', 'classy.bar']);

	angular.module('app6', ['app1', 'app2', 'classy.foo', 'classy.bar']);

	angular.module('app7', ['app1']);

	// This should not cause an error, see https://github.com/davej/angular-classy/issues/36
	angular.module('app8', ['thisModuleDoesNotExist']);

}());
