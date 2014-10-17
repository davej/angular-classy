/*global describe, it, beforeEach, inject, expect, module */
(function () {
	'use strict';

	describe('Todo Javascript Classy Controller', function () {
		var ctrl, scope;
		var todoList;
		var todoStorage = {
			storage: {},
			get: function () {
				return this.storage;
			},
			put: function (value) {
				this.storage = value;
			}
		};
		var ctrlName = 'TodoAsControllerCtrl as todoCtrl';

			// Load the module containing the app, only 'ng' is loaded by default.
		beforeEach(module('todomvc'));

		beforeEach(inject(function ($controller, $rootScope) {
			scope = $rootScope.$new();
			ctrl = $controller(ctrlName, { $scope: scope });
		}));

		it('should not have any controller methods placed on the scope', function () {
			expect(scope.todos).toBeUndefined();
			expect(scope.editTodo).toBeUndefined();
		});

		it('should not have an edited Todo on start', function () {
			expect(ctrl.editedTodo).toBeNull();
		});

		it('should not have any Todos on start', function () {
			expect(ctrl.todos.length).toBe(0);
		});

		it('should have all Todos completed', function () {
			scope.$digest();
			expect(ctrl.allChecked).toBeTruthy();
		});

		describe('the path', function () {
			it('should default to "/"', function () {
				expect(ctrl.$location.path()).toBe('/');
			});

			describe('being at /active', function () {
				it('should filter non-completed', inject(function ($controller) {
					ctrl = $controller(ctrlName, {
						$scope: scope,
						$location: {
							path: function () { return '/active'; }
						}
					});
					scope.$digest();
					expect(ctrl.statusFilter.completed).toBeFalsy();
				}));
			});

			describe('being at /completed', function () {
				it('should filter completed', inject(function ($controller) {
					ctrl = $controller(ctrlName, {
						$scope: scope,
						$location: {
							path: function () { return '/completed'; }
						}
					});

					scope.$digest();
					expect(ctrl.statusFilter.completed).toBeTruthy();
				}));
			});
		});

		describe('having no Todos', function () {
			var ctrl;

			beforeEach(inject(function ($controller) {
				todoStorage.storage = [];
				ctrl = $controller(ctrlName, {
					$scope: scope,
					todoStorage: todoStorage
				});
				scope.$digest();
			}));

			it('should not add empty Todos', function () {
				ctrl.newTodo = '';
				ctrl.addTodo();
				scope.$digest();
				expect(ctrl.todos.length).toBe(0);
			});

			it('should not add items consisting only of whitespaces', function () {
				ctrl.newTodo = '   ';
				ctrl.addTodo();
				scope.$digest();
				expect(ctrl.todos.length).toBe(0);
			});


			it('should trim whitespace from new Todos', function () {
				ctrl.newTodo = '  buy some unicorns  ';
				ctrl.addTodo();
				scope.$digest();
				expect(ctrl.todos.length).toBe(1);
				expect(ctrl.todos[0].title).toBe('buy some unicorns');
			});
		});

		describe('having some saved Todos', function () {
			var ctrl;

			beforeEach(inject(function ($controller) {
				todoList = [{
						'title': 'Uncompleted Item 0',
						'completed': false
					}, {
						'title': 'Uncompleted Item 1',
						'completed': false
					}, {
						'title': 'Uncompleted Item 2',
						'completed': false
					}, {
						'title': 'Completed Item 0',
						'completed': true
					}, {
						'title': 'Completed Item 1',
						'completed': true
					}];

				todoStorage.storage = todoList;
				ctrl = $controller(ctrlName, {
					$scope: scope,
					todoStorage: todoStorage
				});
				scope.$digest();
			}));

			it('should count Todos correctly', function () {
				expect(ctrl.todos.length).toBe(5);
				expect(ctrl.remainingCount).toBe(3);
				expect(ctrl.completedCount).toBe(2);
				expect(ctrl.allChecked).toBeFalsy();
			});

			it('should save Todos to local storage', function () {
				expect(todoStorage.storage.length).toBe(5);
			});

			it('should remove Todos w/o title on saving', function () {
				var todo = todoList[2];
				todo.title = '';

				ctrl.doneEditing(todo);
				expect(ctrl.todos.length).toBe(4);
			});

			it('should trim Todos on saving', function () {
				var todo = todoList[0];
				todo.title = ' buy moar unicorns  ';

				ctrl.doneEditing(todo);
				expect(ctrl.todos[0].title).toBe('buy moar unicorns');
			});

			it('clearCompletedTodos() should clear completed Todos', function () {
				ctrl.clearCompletedTodos();
				expect(ctrl.todos.length).toBe(3);
			});

			it('markAll() should mark all Todos completed', function () {
				ctrl.markAll();
				scope.$digest();
				expect(ctrl.completedCount).toBe(5);
			});

			it('revertTodo() get a Todo to its previous state', function () {
				var todo = todoList[0];
				ctrl.editTodo(todo);
				todo.title = 'Unicorn sparkly skypuffles.';
				ctrl.revertEditing(todo);
				scope.$digest();
				expect(ctrl.todos[0].title).toBe('Uncompleted Item 0');
			});
		});
	});
}());
