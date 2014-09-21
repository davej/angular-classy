# Add 'classy' to your app modules
app = angular.module 'app', ['classy']

# Register your controller and inject your dependencies.
# Injecting dependencies with Classy plays nice with minifiers, you don't need to annotate
# your dependencies (i.e. list dependencies twice) and your code remains DRY.
#
# By the way you can use the shortcut app.cC instead of app.classy.controller if you prefer.
app.classy.controller

  name: 'TodoCtrl'

  inject: ['$scope', '$location', 'todoStorage', 'filterFilter']

# An init method for your initialization code. Who'd have thunk it?
# You can access your dependencies using the class-wide @ symbol.
# The $scope is available using @$ (or you can use @$scope if you prefer).
  init: ->
    @todos = @$.todos = @todoStorage.get()
    @$.newTodo = ''
    @$.location = @$location


# Instead of polluting your init method with lots of calls to `$scope.$watch`, you can put your watchers in the watch object instead.
# If you want to watch an object or collection just use the `{object}` or `{collection}` keyword.
  watch:
    'location.path()': (path) ->
      @$.statusFilter =
        if (path is '/active') then completed: false
        else if (path is '/completed') then completed: true

    '{object}todos': '_onTodoChange'

# Most of the time when you add a function to a controller, you want it available on the $scope.
# Classy automatically puts the function in your $scope so you can easily access it using directives like ng-click.
  addTodo: ->
    newTodo = @$.newTodo.trim()
    @todos.push
      title: newTodo
      completed: false

# Prefix the function name with an underscore and Classy wont add
  _onTodoChange: (newValue, oldValue) ->
    @$.remainingCount = @filterFilter(@todos, completed: false).length
