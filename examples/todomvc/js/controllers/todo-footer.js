/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */


todomvc.classy.controller({
	selector: 'todo-footer',

	inject: ['$scope'],

	// templateUrl: 'js/controllers/todo-app.html',

	init: function() {
		console.log('got here', this.$, this, this.todoApp, this.$.todoApp);
	},



	methods: {
		addTodo: function () {}
	}

});
