data: function() {
  return {
    todos: this.todoStorage.get(),
    editedTodo: null
  }
}