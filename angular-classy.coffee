###
Angular Classy 0.4.1
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

origModuleMethod = angular.module
angular.module = (name, reqs, configFn) ->
  ###
  # We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
  # as a requirement. We also need the module name to we can register our classy controllers.
  # Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
  ###
  module = origModuleMethod(name, reqs, configFn)

  # This is super messy.
  # TODO: Clean this up and test the logic flow properly before moving to master
  if reqs
    for req in reqs
      for pluginName, plugin of availablePlugins
        if pluginName is req
          enabledPlugins[pluginName] = plugin
          if plugin.options
            defaults.controller[plugin.name] = plugin.options

    if 'classy-core' in reqs or 'classy' in reqs
      module.classy = {}

      module.classy.plugin =
        controller: (plugin) -> availablePlugins[name] = plugin

      module.classy.options =
          controller: {}

      module.cC = module.classy.controller = (classObj) ->

        class classyController
          # `classyController` contains only a set of proxy functions for `classFns`,
          # this is because I suspect that performance is better this way.
          # TODO: Test performance to see if this is the most performant way to do it.

          # Pre-initialisation (before instance is created)
          classFns.preInit(@, classObj, module)

          # Initialisation (after instance is created)
          constructor: -> classFns.init(@, arguments, module)

  return module

defaults =
  controller: {}

selectorControllerCount = 0
availablePlugins = {}
enabledPlugins = {}

utils =
  extendDeep: (dst) ->
    for obj in arguments
      if obj isnt dst
        for key, value of obj
          if dst[key] and dst[key].constructor and dst[key].constructor is Object
            @extendDeep dst[key], value
          else
            dst[key] = value
    dst

classFns =
  preInit: (classConstructor, classObj, module) ->
    for own key,value of classObj
      classConstructor::[key] = value

    classConstructor.__options = options =
      utils.extendDeep {}, defaults.controller, module.classy.options.controller, classConstructor.__options

    for pluginName, plugin of enabledPlugins
      if options[plugin.name]
        plugin.options = options[plugin.name]
      plugin.preInit?(classConstructor, classObj, module)

  init: (klass, $inject, module) ->
    options = klass.constructor.__options
    deps = @getDependencies(klass, $inject)

    for pluginName, plugin of enabledPlugins
      plugin.init?(klass, deps, module)

    klass.init?()

  getDependencies: (klass, $inject) ->
    deps = {}
    deps[key] = $inject[i] for key, i in klass.constructor.$inject
    deps

angular.module('classy-core', [])

angular.module('classy-registerSelector', ['classy-core']).classy.plugin.controller
  name: 'register'

  preInit: (classConstructor, classObj, module) ->
    if classObj.el || classObj.selector
      # Register the controller using selector
      @registerSelector(module, classObj.el || classObj.selector, classConstructor)

  registerSelector: (module, selector, classConstructor) ->
    selectorControllerCount++
    controllerName = "ClassySelector#{selectorControllerCount}Controller"
    module.controller controllerName, classConstructor

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

angular.module('classy-register', ['classy-core']).classy.plugin.controller
  name: 'registerSelector'

  preInit: (classConstructor, classObj, module) ->
    if angular.isString(classObj.name)
      # Register the controller using name
      module.controller classObj.name, classConstructor

angular.module('classy-bindDependencies', ['classy-core']).classy.plugin.controller
  name: 'bindDependencies'

  options:
    enabled: true
    scopeShortcut: '$'
    useExistingNameString: '.'

  preInit: (classConstructor, classObj, module) ->
    deps = classObj.inject

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(deps) then @inject(classConstructor, deps)

    # If `deps` is object: Wrap object in array and then inject
    else if angular.isObject(deps) then @inject(classConstructor, [deps], classObj)

  inject: (classConstructor, deps, classObj) ->
    if angular.isObject deps[0]
      classConstructor.__classyControllerInjectObject = injectObject = deps[0]
      deps = (service for service, name of injectObject)

    # Add the `deps` to the controller's $inject annotations.
    classConstructor.$inject = deps

  init: (klass, deps, module) ->
    if @options.enabled
      injectObject = klass.constructor.__classyControllerInjectObject
      injectObjectMode = !!injectObject

      # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
      for key, i in klass.constructor.$inject
        dependency = deps[key]

        # If the named dependency is assigned a name that is different from the original name
        if (injectObjectMode and (injectName = injectObject[key]) and
            injectName != @options.useExistingNameString)
          klass[injectName] = dependency
        else
          klass[key] = dependency

          if key is '$scope' and @options.scopeShortcut
            # Add a shortcut to the $scope (by default `this.$`)
            klass[@options.scopeShortcut] = klass[key]

angular.module('classy-addFnsToScope', ['classy-core']).classy.plugin.controller
  name: 'addFnsToScope'

  options:
    enabled: true
    privateMethodPrefix: '_'
    ignore: ['constructor', 'init']

  hasPrivateMethodPrefix: (string) ->
    prefix = @options.privateMethodPrefix
    string.slice(0, prefix.length) != prefix

  init: (klass, deps, module) ->
    # Adds controller functions (unless they have a `_` prefix) to the `$scope`
    if @options.enabled
      for key, fn of klass.constructor::
        if angular.isFunction(fn) and !(key in @options.ignore)
          klass[key] = angular.bind(klass, fn)
          if @hasPrivateMethodPrefix(key)
            deps.$scope[key] = klass[key]

angular.module('classy-watch', ['classy-core']).classy.plugin.controller
  name: 'watch'

  options:
    enabled: true
    _watchKeywords:
      normal: []
      objectEquality: ['{object}', '{deep}']
      collection: ['{collection}', '{shallow}']

  isActive: (klass, deps) ->
    if !deps.$scope
      throw new Error "You need to inject `$scope` to use the watch object"

    return @options.enabled and angular.isObject(klass.watch) and deps.$scope

  watchFns:
    normal: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn))
    objectEquality: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn), true)
    collection: (klass, expression, fn, deps) ->
        deps.$scope.$watchCollection(expression, angular.bind(klass, fn))

  init: (klass, deps, module) ->
    if !@isActive(klass, deps) then return

    watchKeywords = @options._watchKeywords

    for expression, fn of klass.watch
      if angular.isString(fn) then fn = klass[fn]
      if angular.isString(expression) and angular.isFunction(fn)
        watchRegistered = false

        # Search for keywords that identify it is a non-standard watch
        for watchType, watchFn of @watchFns
          if watchRegistered then break
          for keyword in watchKeywords[watchType]
            if expression.indexOf(keyword) isnt -1
              watchFn(klass, expression.replace(keyword, ''), fn, deps)
              watchRegistered = true
              break

        # If no keywords have been found then register it as a normal watch
        if !watchRegistered then this.watchFns.normal(klass, expression, fn, deps)

angular.module 'classy',  [
                            'classy-bindDependencies',
                            'classy-addFnsToScope',
                            'classy-watch',
                            'classy-registerSelector',
                            'classy-register'
                          ]
