/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */


todomvc.classy.component({
	selector: 'todo-app',

	inject: ['$location', 'todoStorage'],

	templateUrl: 'js/controllers/todo-app.html',

	data:{
		todos: 'todoStorage.get()',
		newTodo: '""',
		editedTodo: null,
		location: '$location'
	},

	init: function() {
		if (this.location.path() === '') {
			this.location.path('/');
		}
	},

	observe: {
		'location.path()': function(path) {
			this.statusFilter = (path === '/active') ?
				{ completed: false } : (path === '/completed') ?
				{ completed: true } : '';
		},
		'todos{object}': '_onTodoChange'
	},

	methods: {
		_getRemainingCount: '(todos | filter:{ completed: false }).length',

		_onTodoChange: function () {
			this.remainingCount = this._getRemainingCount();
			this.completedCount = this.todos.length - this.remainingCount;
			this.allChecked = !this.remainingCount;
			this.todoStorage.put(this.todos);
		},

		addTodo: function () {
			var newTodo = this.newTodo.trim();
			if (!newTodo.length) {
				return;
			}

			this.todos.push({
				title: newTodo,
				completed: false
			});

			this.newTodo = '';
		},

		editTodo: function (todo) {
			this.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			this.originalTodo = angular.extend({}, todo);
		},

		doneEditing: function (todo) {
			this.editedTodo = null;
			todo.title = todo.title.trim();

			if (!todo.title) {
				this.removeTodo(todo);
			}
		},

		revertEditing: function (todo) {
			this.todos[this.todos.indexOf(todo)] = this.originalTodo;
			this.doneEditing(this.originalTodo);
		},

		removeTodo: function (todo) {
			this.todos.splice(this.todos.indexOf(todo), 1);
		},

		clearCompletedTodos: function () {
			this.todos = this.todos.filter(function (val) {
				return !val.completed;
			});
		},

		markAll: function (completed) {
			this.todos.forEach(function (todo) {
				todo.completed = completed;
			});
		}
	}

});
