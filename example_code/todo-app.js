// Add 'classy' to your app modules

var app = angular.module('app', ['classy']);

// Registers your controller and inject your dependencies.
// Injecting dependencies with Classy plays nice with minifiers, you don't need to annotate
// your dependencies (i.e. list dependencies twice) and your code remains DRY.
//
// By the way you can use the shortcut app.cC instead of app.classy.controller if you prefer.

app.classy.controller({

  name: 'TodoCtrl',

  inject: ['$scope', '$location', 'todoStorage', 'filterFilter'],


// An init method for your initialization code. Who'd have thunk it?
// You can access your dependencies using the class-wide this symbol.
// The $scope is available using this.$ (or you can use this.$scope if you prefer).

  init: function() {
    this.todos = this.$.todos = this.todoStorage.get();
    this.$.newTodo = '';
    this.$.location = this.$location;
  },


// Instead of polluting your init method with lots of calls to $scope.$watch,
// you can put your watchers in the watch object instead.
// If you want to watch an object or collection just use the {object} or {collection} keyword.

  watch: {
    'location.path()': function(path) {
      this.$.statusFilter = (path === '/active') ?
        { completed: false } : (path === '/completed') ?
        { completed: true };
    },

    '{object}todos': '_onTodoChange'
  },

// Most of the time when you add a function to a controller, you want it available on the `$scope`.
// Classy automatically puts the function in your `$scope` so you can easily access it using directives like ng-click.

  addTodo: function() {
    var newTodo = this.$.newTodo.trim();
    this.todos.push({
      title: newTodo,
      completed: false
    });
  },

// Prefix the function name with an underscore and Classy wont add it to the $scope.

  _onTodoChange: function(newValue, oldValue) {
    this.$.remainingCount =
      this.filterFilter(this.todos, { completed: false }).length;
  }

});
