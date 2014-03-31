/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */

todomvc.classyController({
	name: 'TodoCtrl',
	inject: ['$scope', '$location', 'todoStorage', 'filterFilter'],

	init: function() {
		this.todos = this.$scope.todos = this.todoStorage.get();

		this.$scope.newTodo = '';
		this.$scope.editedTodo = null;

		if (this.$location.path() === '') {
			this.$location.path('/');
		}
		this.$scope.location = this.$location;
	},

	watch: {
		'location.path()': function(path) {
			this.$scope.statusFilter = (path === '/active') ?
				{ completed: false } : (path === '/completed') ?
				{ completed: true } : null;
		},
		'{object}todos': '_onTodoChange'
	},


	_onTodoChange: function (newValue, oldValue) {
		this.$scope.remainingCount = this.filterFilter(this.todos, { completed: false }).length;
		this.$scope.completedCount = this.todos.length - this.$scope.remainingCount;
		this.$scope.allChecked = !this.$scope.remainingCount;
		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
			this.todoStorage.put(this.todos);
		}
	},

	addTodo: function () {
		var newTodo = this.$scope.newTodo.trim();
		if (!newTodo.length) {
			return;
		}

		this.todos.push({
			title: newTodo,
			completed: false
		});

		this.$scope.newTodo = '';
	},

	editTodo: function (todo) {
		this.$scope.editedTodo = todo;
		// Clone the original todo to restore it on demand.
		this.$scope.originalTodo = angular.extend({}, todo);
	},

	doneEditing: function (todo) {
		this.$scope.editedTodo = null;
		todo.title = todo.title.trim();

		if (!todo.title) {
			this.$scope.removeTodo(todo);
		}
	},

	revertEditing: function (todo) {
		this.todos[this.todos.indexOf(todo)] = this.$scope.originalTodo;
		this.$scope.doneEditing(this.$scope.originalTodo);
	},

	removeTodo: function (todo) {
		this.todos.splice(this.todos.indexOf(todo), 1);
	},

	clearCompletedTodos: function () {
		this.$scope.todos = this.todos = this.todos.filter(function (val) {
			return !val.completed;
		});
	},

	markAll: function (completed) {
		this.todos.forEach(function (todo) {
			todo.completed = completed;
		});
	}

});
