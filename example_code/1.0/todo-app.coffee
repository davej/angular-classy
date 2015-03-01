# Add 'classy' to your app modules
app = angular.module 'app', ['classy']

# Register your controller and inject your dependencies.
# Injecting dependencies with Classy plays nice with minifiers, you don't need to annotate
# your dependencies (i.e. list dependencies twice) and your code remains DRY.
#
# By the way you can use the shortcut app.cC instead of app.classy.controller if you prefer.
app.classy.controller

  name: 'TodoController'

  inject: ['$scope', 'todoStorage']

# **New in 1.0!** The data object is a simple structure that allows you to easily assign properties.
#
# You can either use a string representing an [angular expression](https:#docs.angularjs.org/guide/expression),
# or you can directly assign any other object/primitive.
#
# Classy automatically makes items in the data object available class-wide (and on the `$scope`).
#
# This feature helps to move boilerplate assignments out of the `init` method.
  data:
    todos: 'todoStorage.get()',

# An init method for your initialization code!
# You can access your dependencies using the class-wide `@` symbol.
# The `$scope` is available using `@$` (or you can use `@$scope` if you prefer).
  init: -> @_resetEntryField()


# Instead of polluting your init method with lots of calls to `$scope.$watch`,
# you can put your watchers in the watch object instead.
# If you want to watch an object or collection just use the `{object}` or `{collection}` keyword.
  watch:
    '{object}todos': '_onTodoChange'

# **New in 1.0!** Controller methods are defined inside of the `methods` object.
#
# Classy automatically makes methods available class-wide (through `@methodName`) and also on the `$scope`
# so you can easily access it using directives like ng-click.
#
# Prefix the method name with an underscore and Classy wont add it to the `$scope`.
#
# You can also define methods using angular expressions (see `_getRemainingCount()`).
# Whenever the expression method is called it will evaluate the expression and return the expression's result.
  methods:

    _getRemaining: 'items | filter:{ complete: false }'

    _onTodoChange: ->
      @$.remainingCount = @_getRemaining().length #!
      @todoStorage.put @items #!

    addTodo: ->
      @$.items.push #!
        text: @$.newTodo #!
        complete: false #!
      @_resetEntryField() #!

    _resetTodoEntry: -> @$.newTodo = ''
