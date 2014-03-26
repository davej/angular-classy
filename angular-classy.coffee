###
Angular Classy 1.1.1
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

classFns =
  selectorControllerCount: 0

  construct: (parent, args) ->
    @bindDependencies(parent, args)
    @addFnsToScope(parent)
    parent.init?()
    if angular.isObject(parent.watch) then @registerWatchers(parent)

  addFnsToScope: (parent) ->
    # Adds controller functions (unless they have a `_` prefix) to the `$scope`
    $scope = parent[parent.constructor::__classyControllerScopeName]
    for key, fn of parent.constructor::
      continue unless angular.isFunction(fn)
      continue if key in ['constructor', 'init', 'watch'] or key[0] is '_'
      $scope[key] = angular.bind(parent, fn)

  bindDependencies: (parent, args) ->
    injectObject = parent.__classyControllerInjectObject
    injectObjectMode = !!injectObject

    # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
    for key, i in parent.constructor.$inject
      if injectObjectMode and (injectName = injectObject[key]) and injectName != '.'
        parent[injectName] = args[i]
      else
        parent[key] = args[i]

  registerWatchers: (parent) ->
    # Iterates over the watch object and creates the appropriate `$scope.$watch` listener
    $scope = parent[parent.constructor::__classyControllerScopeName]

    watchTypes =
      normal:
        keywords: []
        fnCall: (parent, expression, fn) ->
          $scope.$watch(expression, angular.bind(parent, fn))
      objectEquality:
        keywords: ['{object}', '{deep}']
        fnCall: (parent, expression, fn) ->
          $scope.$watch(expression, angular.bind(parent, fn), true)
      collection:
        keywords: ['{collection}', '{shallow}']
        fnCall: (parent, expression, fn) ->
          $scope.$watchCollection(expression, angular.bind(parent, fn))

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

  inject: (parent, deps) ->
    if angular.isObject deps[0]
      parent::__classyControllerInjectObject = injectObject = deps[0]
      deps = (service for service, name of injectObject)

      if injectObject?['$scope'] and injectObject['$scope'] != '.'
        parent::__classyControllerScopeName = injectObject['$scope']

    # Add the `deps` to the controller's $inject annotations.
    parent.$inject = deps

  # compileController: (el, controllerName) ->
  #   el.setAttribute('data-ng-controller', controllerName);
  #   window.setTimeout ->
  #     angular.element(document).injector().invoke ($compile) ->
  #       scope = angular.element(el).scope()
  #       $compile(el)(scope)
  #   , 0

  registerSelector: (appInstance, selectorString, parent) ->
    @selectorControllerCount++
    controllerName =
      "#{selectorString.replace(/\W/g, '')}ClassySelector#{@selectorControllerCount}Controller"
    appInstance.controller controllerName, parent

    els = window.jQuery?(selectorString) or document.querySelectorAll(selectorString)
    el.setAttribute('data-ng-controller', controllerName) for el in els

  register: (appInstance, name, deps, parent) ->
    if name.indexOf('$') is 0
      # If first character of `name` is '$' then treat it as a selector
      @registerSelector(appInstance, name.slice(1), parent)
    else
      # Register the controller
      appInstance.controller name, parent

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(deps) then @inject(parent, deps)

    # If `deps` is object: Wrap object in array and then inject
    else if angular.isObject(deps) then @inject(parent, [deps])

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

      __classyControllerScopeName: '$scope'

      @register: (name, deps) ->
        # Registers controller and optionally inject dependencies
        classFns.register(module, name, deps, @)

      @inject: (deps...) ->
        # Injects the `dep`s
        classFns.inject(@, deps)

      @create: (name, deps, proto) ->
        # This method allows for nicer syntax for those not using CoffeeScript
        classFns.create(module, name, deps, proto, @)

      constructor: ->
        # Where the magic happens
        classFns.construct(@, arguments)

    module.cC = module.classyController = classyController

  return module

angular.module('classy', []);