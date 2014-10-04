### global todomvc, angular ###

'use strict'

###
# The main controller for the app. The controller:
# - retrieves and persists the model via the todoStorage service
# - exposes the model to the template and provides event handlers
###

todoFuncs =

  data:
    newTodo: 'Getting funky'

  init: ->
    @todos = @$.todos = @todoStorage.get()

    @$.editedTodo = null

    if @$loc.path() is '' then @$loc.path('/')
    @$.location = @$loc

  watch:
    'location.path()': (path) ->
      @$.statusFilter =
        if (path is '/active') then completed: false
        else if (path is '/completed') then completed: true
        else null

    '{object}todos': '_onTodoChange'

  methods:
    _onTodoChange: (newValue, oldValue) ->
      @$.remainingCount = @fF(@todos, { completed: false }).length
      @$.completedCount = @todos.length - @$.remainingCount
      @$.allChecked = !@$.remainingCount
      if newValue != oldValue # This prevents unneeded calls to the local storage
        @todoStorage.put(@todos)

    addTodo: ->
      newTodo = @$.newTodo.trim()
      if !newTodo.length then return
      @todos.push
        title: newTodo
        completed: false

      @$.newTodo = ""

    editTodo: (todo) ->
      @$.editedTodo = todo
      # Clone the original todo to restore it on demand.
      @$.originalTodo = angular.extend({}, todo)

    doneEditing: (todo) ->
      @$.editedTodo = null
      todo.title = todo.title.trim()
      @$.removeTodo todo unless todo.title

    revertEditing: (todo) ->
      @todos[@todos.indexOf(todo)] = @$.originalTodo
      @$.doneEditing @$.originalTodo

    removeTodo: (todo) ->
      @todos.splice @todos.indexOf(todo), 1

    clearCompletedTodos: ->
      @$.todos = @todos =
        @todos.filter (val) -> !val.completed

    markAll: (completed) ->
      for todo in @todos
        todo.completed = completed

todomvc.cC angular.extend todoFuncs,
  name: 'ThisDoesNotMapToNgController'
  el: '#todoapp'

  inject:
    $scope: '$'
    $location: '$loc'
    todoStorage: '.'
    filterFilter: 'fF'

