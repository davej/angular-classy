###
Angular Classy 1.0
Dave Jeffery, @DaveJ
License: MIT
###

###
Why use angular-classy?
  1. It's class-based, classes are a nice way to organize your code
  2. You can use Coffeescript `Class` syntax, or if you prefer, use the convenient `classyController.create` Javascript function
  3. It's only 2KB (gzipped and minified)
  4. No need to annotate your dependancies to play nicely with minifiers, it just works
  5. Functions are automatically added to the controller's `$scope`, if you want the function to remain private just add a `_` to the function name
  6. It uses a lovely `watch` object for setting up your watchers without polluting the `init` method
###

### global angular ###

'use strict';

classFns =
  construct: (parent, args) ->
    @bindDependancies(parent, args)
    @addFnsToScope(parent)
    parent.init?()
    if angular.isObject(parent.watch) then @registerWatchers(parent)

  addFnsToScope: (parent) ->
    # Adds controller functions (unless they have a `_` prefix) to the `$scope`
    for key, fn of parent.constructor.prototype
      continue unless angular.isFunction(fn)
      continue if key in ['constructor', 'init', 'watch'] or key[0] is '_'
      parent.$scope[key] = angular.bind(parent, fn)

  bindDependancies: (parent, args) ->
    # Takes the `$inject` dependancies and assigns a class-wide (`@`) variable to each one.
    for key, i in parent.constructor.$inject
      parent[key] = args[i]

  registerWatchers: (parent) ->
    # Iterates over the watch object and creates the appropriate `$scope.$watch` listener
    watchTypes =
      normal:
        keywords: []
        fnCall: (parent, expression, fn) ->
          parent.$scope.$watch(expression, angular.bind(parent, fn))
      objectEquality:
        keywords: ['{object}', '{deep}']
        fnCall: (parent, expression, fn) ->
          parent.$scope.$watch(expression, angular.bind(parent, fn), true)
      collection:
        keywords: ['{collection}', '{shallow}']
        fnCall: (parent, expression, fn) ->
          parent.$scope.$watchCollection(expression, angular.bind(parent, fn))

    for expression, fn of parent.watch
      if angular.isString(fn) then fn = parent[fn]
      if angular.isString(expression) and angular.isFunction(fn)
        watchRegistered = false

        # Search for keywords that identify it is a non-standard watch 
        for watchType of watchTypes
          if watchRegistered then break
          for keyword in watchTypes[watchType].keywords
            if watchRegistered then break
            if expression.indexOf(keyword) isnt -1
              watchTypes[watchType].fnCall(parent, expression.replace(keyword, ''), fn)
              watchRegistered = true

        # If no keywords have been found then register it as a normal watch
        if !watchRegistered then watchTypes.normal.fnCall(parent, expression, fn)


  register: (appInstance, name, deps, parent) ->
    # Inject the `deps`.
    parent.$inject = deps

    # Register the controller.
    appInstance.controller name, parent

  create: (module, name, deps, proto, parent) ->
    # Helper function that allows us to use an object literal instead of coffeescript classes (or prototype messiness)
    c = class extends parent
      @register(name, deps, module)
    for own key,value of proto
      c::[key] = value
    return c


origMethod = angular.module
angular.module = (name, reqs, configFn) ->
  ###
  # We have to override the `angular.module` method to see if 'classy' has been specified
  # as a requirement. We also need the module name to we can register our classy controllers.
  # Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
  ###
  module = origMethod(name, reqs, configFn)

  # If this module has required 'classy' then we're going to add `classyController`
  if reqs and 'classy' in reqs
    class classyController
      # `classyController` is only a set of proxy functions for `classFns`,
      # this is because I suspect that performance is better this way.
      # TODO: Test performance to see if this is the best way to do it.

      @register: (name, deps) ->
        # Registers controller and `$inject`s dependancies
        classFns.register(module, name, deps, @)

      @create: (name, deps, proto) ->
        # This method allows for nicer syntax for those not using CoffeeScript
        classFns.create(module, name, deps, proto, @)

      constructor: ->
        # Where the magic happens
        classFns.construct(@, arguments)

    module.classyController = classyController

  return module

angular.module('classy', []);