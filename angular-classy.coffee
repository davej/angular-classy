###
Angular Classy 0.4.2
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

defaults =
  controller:
    addFnsToScope: true
    watchObject: true
    _scopeName: '$scope'
    _scopeShortcut: true
    _scopeShortcutName: '$'
    _watchKeywords:
      objectEquality: ['{object}', '{deep}']
      collection: ['{collection}', '{shallow}']


origMethod = angular.module
angular.module = (name, reqs, configFn) ->
  ###
  # We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
  # as a requirement. We also need the module name to we can register our classy controllers.
  # Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
  ###
  module = origMethod(name, reqs, configFn)

  # If this module has required 'classy' then we're going to add `classyController`
  if reqs and 'classy' in reqs
    module.classy =
      options:
        controller: {}

      controller: (classObj) ->
        classObj.__options = angular.extend {}, defaults.controller, module.classy.options.controller, classObj.__options
        c = class classyController
          # `classyController` contains only a set of proxy functions for `classFns`,
          # this is because I suspect that performance is better this way.
          # TODO: Test performance to see if this is the most performant way to do it.

          __options: classObj.__options

          # Create the Classy Controller
          classFns.create(module, classObj, @)

          constructor: ->
            # Where the magic happens
            classFns.construct(@, arguments)

        for own key,value of classObj
          c::[key] = value

        return c

    module.cC = module.classyController = module.classy.controller


  return module

angular.module('classy', []);

classFns =
  selectorControllerCount: 0

  construct: (parent, args) ->
    options = parent.constructor::__options
    @bindDependencies(parent, args)
    if options.addFnsToScope then @addFnsToScope(parent)
    parent.init?()
    if options.watchObject and angular.isObject(parent.watch)
      @registerWatchers(parent)

  addFnsToScope: (parent) ->
    # Adds controller functions (unless they have a `_` prefix) to the `$scope`
    $scope = parent[parent.constructor::__options._scopeName]
    for key, fn of parent.constructor::
      continue unless angular.isFunction(fn)
      continue if key in ['constructor', 'init', 'watch']
      parent[key] = angular.bind(parent, fn)
      if key[0] isnt '_'
        $scope[key] = parent[key]

  bindDependencies: (parent, args) ->
    injectObject = parent.__classyControllerInjectObject
    injectObjectMode = !!injectObject
    options = parent.constructor::__options

    # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
    for key, i in parent.constructor.$inject
      if injectObjectMode and (injectName = injectObject[key]) and injectName != '.'
        parent[injectName] = args[i]
      else
        parent[key] = args[i]

        if key is options._scopeName and options._scopeShortcut
          # Add a shortcut to the $scope (by default `this.$`)
          parent[options._scopeShortcutName] = parent[key]

  registerWatchers: (parent) ->
    # Iterates over the watch object and creates the appropriate `$scope.$watch` listener
    $scope = parent[parent.constructor::__options._scopeName]

    if !$scope
      throw new Error "You need to inject `$scope` to use the watch object"

    watchKeywords = parent.constructor::__options._watchKeywords
    watchTypes =
      normal:
        keywords: []
        fnCall: (parent, expression, fn) ->
          $scope.$watch(expression, angular.bind(parent, fn))
      objectEquality:
        keywords: watchKeywords.objectEquality
        fnCall: (parent, expression, fn) ->
          $scope.$watch(expression, angular.bind(parent, fn), true)
      collection:
        keywords: watchKeywords.collection
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

      scopeName = parent::__options._scopeName
      if injectObject?[scopeName] and injectObject[scopeName] != '.'
        parent::__options._scopeName = injectObject[scopeName]

    # Add the `deps` to the controller's $inject annotations.
    parent.$inject = deps

  registerSelector: (appInstance, selector, parent) ->
    @selectorControllerCount++
    controllerName = "ClassySelector#{@selectorControllerCount}Controller"
    appInstance.controller controllerName, parent

    if angular.isElement(selector)
      selector.setAttribute('data-ng-controller', controllerName)
      return

    if angular.isString(selector)
      # Query the dom using jQuery if available, otherwise fallback to qSA
      els = window.jQuery?(selector) or document.querySelectorAll(selector)
    else if angular.isArray(selector)
      els = selector
    else return

    for el in els
      if angular.isElement(el)
        el.setAttribute('data-ng-controller', controllerName)

  create: (appInstance, classObj, parent) ->
    if classObj.el || classObj.selector
      # Register the controller using selector
      @registerSelector(appInstance, classObj.el || classObj.selector, parent)

    if angular.isString(classObj.name)
      # Register the controller using name
      appInstance.controller classObj.name, parent

    deps = classObj.inject

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(deps) then @inject(parent, deps)

    # If `deps` is object: Wrap object in array and then inject
    else if angular.isObject(deps) then @inject(parent, [deps])
