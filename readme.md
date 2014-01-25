# Angular Classy [![Build Status](https://travis-ci.org/davej/angular-classy.png)](https://travis-ci.org/davej/angular-classy)

#### Cleaner class-based controllers with Angular

Angular Classy makes it easy to do class-based controllers with [AngularJS](http://angularjs.org).

## Why use Angular Classy?

Here are six reasons:

1. Class-based!
2. It plays nicely with Coffeescript and Javascript
3. It's only 2KB (gzipped and minified)
4. No need to annotate your dependancies anymore
5. Functions are automatically added to the controller's `$scope`
6. Special object for `$watch` listeners

Sounds good, eh? Lets go through it point-by-point.

### 1. It's class-based

YMMV but I find classes are a nice way to organize your code. They also happen to fit ever-so-nicely with Angular's controllers but more on this later.

### 2. Plays nicely with Coffeescript \*and\* Javascript

Classy was originally designed for use with Coffeescript's `Class` syntax. Not everybody likes to party with Coffeescript though, for vanilla Javascript folks there's a super-convenient `classyController.create` Javascript method. Whoop, everybody is invited to the party!

### 3. Only 2KB (gzipped and minified)

Yup, it's super tiny so you don't have to worry about it adding weight to your application. Next up, I'm going to performance test it against standard (non-Classy) Angular controllers (initial testing seems to indicate that they're roughly the same).

### 4. No need to annotate your dependancies

This is a big-ee. Angular veterans will know that if you want your Angular code to work with minifiers (which is very important for production apps) then you have to annotate your dependancies like so:

```JavaScript
app.controller('AppCtrl', ['$scope', '$location', '$http', 'filterFilter', function ($scope, $location, $http, filterFilter) {
  // ...
}]);
```

Yeurgh that's not very DRY, if I want to add/remove a dependancy then I need to remember to do it two places. In Classy you don't need to do that, it works with minifiers and your code remains DRY:

```JavaScript
app.classyController.create('AppCtrl', ['$scope', '$location', 'filterFilter'], {
  // ...
});
```

Or if you know how to play Coffeescript then you can do it like this:

```CoffeeScript
class extends app.classyController
  @register 'AppCtrl', ['$scope', '$location', 'filterFilter']
```

*I should explain what's going on here. When you create/register with the classyController, each of your dependancies are available using the `this` keyword. This means that if you want to access `$scope.foo` then you access it using `this.$scope.foo` (or just `@$scope.foo` in Coffeescript).*

### 5. Functions are automatically added to the controller's `$scope`

Most of the time when you add a function to a controller, you want it available on the `$scope`. This is so that you can easily call it in your html using directives like `ng-click`. Let see how this looks, **without Classy**:

```JavaScript
$scope.editTodo = function (todo) {
  // ...
};
```

and now **with Classy**:

```JavaScript
editTodo = function (todo) {
  // editTodo is available on the $scope
}
```

If we don't want the function to be on the `$scope` then just prefix it with an underscore (`_`)

```JavaScript
_editTodo = function (todo) {
  // _editTodo is *not* available on the $scope
}
```

### 6. Special object for `$watch` listeners

Instead of polluting your `init` method with lots of calls to `$watch`, like so:

```JavaScript
init: function () {
  // Lots of controller init code goes here

  this.$scope.$watch('location.path()', function (newValue, oldValue) {
    // ...
  });

  this.$scope.$watch('todos', function (newValue, oldValue) {
    // ...
  }, true);
}
```

*Notice the `true` at the end of the second $watch (line 10), Angular uses this to indicate that it will compare the object for equality rather than for reference. It's not very obvious or intuitive, Classy has a more explicit approach.*

Here's how Classy does it, You define all your `watch` listeners in their own object inside your class:

```JavaScript
watch: {
  'location.path()': function(newValue, oldValue) {
    // ...
  },
  '{object}todos': function (newValue, oldValue) {
    // ...
  }
}
```

*Notice the `{object}` keyword in the second listener above (`'{object}todos'`, line 5). This allows you to easily specify the type of watcher to use. This is much more explicit than Angular's approach. Here is a table of the available keywords*


| Keyword                       | $watch Type                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `{collection}` or `{shallow}` | [`$watchCollection(..)`](http://docs.angularjs.org/api/ng.$rootScope.Scope#methods_$watch_example_parameters)     |
| `{object}` or `{deep}`        | [`$watch(.., objectEquality = true)`](http://docs.angularjs.org/api/ng.$rootScope.Scope#methods_$watchcollection) |


You can also reference a function instead of writing your functions anonymously inline:

```JavaScript
watch: {
  'location.path()': '_onPathChange',
  '{object}todos': '_onTodoChange'
},

_onPathChange: function (newValue, oldValue) {
  // ...
},

_onTodoChange: function (newValue, oldValue) {
  // ...
}
```

## Install

Install with `bower`:

```shell
bower install angular-classy
```

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular-classy/angular-classy.js"></script>
```

Add `classy` to your application module:

```JavaScript
var app = angular.module('app', ['classy']);
```

## So what does a Classy controller look like?

Yes sir/madame! I've taken the angular controller from the [TodoMVC](http://todomvc.com/) project and made it classy. Here is what the controller looks like, first in Coffeescript then in Javascript:

### Coffeescript

```CoffeeScript
todomvc = angular.module('todomvc', ['classy'])

class extends todomvc.classyController
  @register 'TodoCtrl', ['$scope', '$location', 'todoStorage', 'filterFilter']

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
    return unless newTodo.length
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
```

### Javascript

```JavaScript
var todomvc = angular.module('todomvc', ['classy']);

todomvc.classyController.create('TodoCtrl', ['$scope', '$location', 'todoStorage', 'filterFilter'], {

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
    this.todos.splice(todos.indexOf(todo), 1);
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
```

## What's next

* ~~Tests~~ **Unit tests now added (based on the TodoMVC controller)**
* ~~Make it work with Bower~~ **Now works with bower**
* Better documentation (and a github.io site)
* Performance testing
* Investigate other Classy Angular stuff (especially services and directives)

## Thanks

* [@elado](https://github.com/elado) and [this gist](https://gist.github.com/elado/8138516).
* [@ahmednuaman](https://github.com/ahmednuaman) and his project [Radian](https://github.com/ahmednuaman/radian).


## License

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.