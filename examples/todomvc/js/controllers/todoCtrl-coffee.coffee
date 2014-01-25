### global todomvc, angular ###

'use strict'

###
# The main controller for the app. The controller:
# - retrieves and persists the model via the todoStorage service
# - exposes the model to the template and provides event handlers
###

class extends todomvc.classyController
  @register 'TodoCoffeeCtrl', ['$scope', '$location', 'todoStorage', 'filterFilter']

  init: ->
    @todos = @$scope.todos = @todoStorage.get()

    @$scope.newTodo = ''
    @$scope.editedTodo = null

    if @$location.path() is '' then @$location.path('/')
    @$scope.location = @$location

  watch:
    'location.path()': (path) ->
      @$scope.statusFilter =
        if (path is '/active') then completed: false
        else if (path is '/completed') then completed: true
        else null

    '{object}todos': '_onTodoChange'

  _onTodoChange: (newValue, oldValue) ->
    @$scope.remainingCount = @filterFilter(@todos, { completed: false }).length
    @$scope.completedCount = @todos.length - @$scope.remainingCount
    @$scope.allChecked = !@$scope.remainingCount
    if newValue != oldValue # This prevents unneeded calls to the local storage
      @todoStorage.put(@todos)

  addTodo: ->
    newTodo = @$scope.newTodo.trim()
    if !newTodo.length then return
    @todos.push
      title: newTodo
      completed: false

    @$scope.newTodo = ""

  editTodo: (todo) ->
    @$scope.editedTodo = todo
    # Clone the original todo to restore it on demand.
    @$scope.originalTodo = angular.extend({}, todo)

  doneEditing: (todo) ->
    @$scope.editedTodo = null
    todo.title = todo.title.trim()
    @$scope.removeTodo todo unless todo.title

  revertEditing: (todo) ->
    @todos[@todos.indexOf(todo)] = @$scope.originalTodo
    @$scope.doneEditing @$scope.originalTodo

  removeTodo: (todo) ->
    @todos.splice @todos.indexOf(todo), 1

  clearCompletedTodos: ->
    @$scope.todos = @todos =
      @todos.filter (val) -> !val.completed

  markAll: (completed) ->
    @todos.forEach (todo) ->
      todo.completed = completed      