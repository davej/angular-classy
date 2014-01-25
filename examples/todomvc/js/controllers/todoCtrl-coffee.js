// Generated by CoffeeScript 1.6.3
var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(_super) {
  __extends(_Class, _super);

  function _Class() {
    _ref = _Class.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  _Class.register('TodoCoffeeCtrl', ['$scope', '$location', 'todoStorage', 'filterFilter']);

  _Class.prototype.init = function() {
    this.todos = this.$scope.todos = this.todoStorage.get();
    this.$scope.newTodo = '';
    this.$scope.editedTodo = null;
    if (this.$location.path() === '') {
      this.$location.path('/');
    }
    return this.$scope.location = this.$location;
  };

  _Class.prototype.watch = {
    'location.path()': function(path) {
      return this.$scope.statusFilter = path === '/active' ? {
        completed: false
      } : path === '/completed' ? {
        completed: true
      } : null;
    },
    '{object}todos': '_onTodoChange'
  };

  _Class.prototype._onTodoChange = function(newValue, oldValue) {
    this.$scope.remainingCount = this.filterFilter(this.todos, {
      completed: false
    }).length;
    this.$scope.completedCount = this.todos.length - this.$scope.remainingCount;
    this.$scope.allChecked = !this.$scope.remainingCount;
    if (newValue !== oldValue) {
      return this.todoStorage.put(this.todos);
    }
  };

  _Class.prototype.addTodo = function() {
    var newTodo;
    newTodo = this.$scope.newTodo.trim();
    if (!newTodo.length) {
      return;
    }
    this.todos.push({
      title: newTodo,
      completed: false
    });
    return this.$scope.newTodo = "";
  };

  _Class.prototype.editTodo = function(todo) {
    this.$scope.editedTodo = todo;
    return this.$scope.originalTodo = angular.extend({}, todo);
  };

  _Class.prototype.doneEditing = function(todo) {
    this.$scope.editedTodo = null;
    todo.title = todo.title.trim();
    if (!todo.title) {
      return this.$scope.removeTodo(todo);
    }
  };

  _Class.prototype.revertEditing = function(todo) {
    this.todos[this.todos.indexOf(todo)] = this.$scope.originalTodo;
    return this.$scope.doneEditing(this.$scope.originalTodo);
  };

  _Class.prototype.removeTodo = function(todo) {
    return this.todos.splice(this.todos.indexOf(todo), 1);
  };

  _Class.prototype.clearCompletedTodos = function() {
    return this.$scope.todos = this.todos = this.todos.filter(function(val) {
      return !val.completed;
    });
  };

  _Class.prototype.markAll = function(completed) {
    return this.todos.forEach(function(todo) {
      return todo.completed = completed;
    });
  };

  return _Class;

})(todomvc.classyController);
