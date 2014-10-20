###
Angular Classy 1.0.0 - Beta 2
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

availablePlugins = {}

getActiveClassyPlugins = (name, origModule) ->
  obj = {}
  do getNextRequires = (name) ->
    module = angular.module(name)
    for pluginName in module.requires
      plugin = availablePlugins[pluginName]
      if plugin
        obj[pluginName] = plugin
        origModule.__classyPluginDefaults ?= {}
        origModule.__classyPluginDefaults[plugin.name] = angular.copy plugin.options or {}
      getNextRequires(pluginName)

  return obj


pluginDo = (methodName, params, obj) ->
  plugins = params[0].__plugins or params[0]::__plugins
  for pluginName, plugin of plugins
    obj?.before?(plugin)
    returnVal = plugin[methodName]?.apply(plugin, params)
    obj?.after?(plugin, returnVal)

copyAndExtendDeep = (dst) ->
  for obj in arguments
    if obj isnt dst
      for key, value of obj
        if dst[key] and dst[key].constructor and dst[key].constructor is Object
          copyAndExtendDeep dst[key], value
        else
          dst[key] = angular.copy(value)
  dst

origModuleMethod = angular.module
angular.module = (name, reqs, configFn) ->
  ###
  # We have to monkey-patch the `angular.module` method to see if 'classy' has been specified
  # as a requirement. We also need the module name to we can register our classy controllers.
  # Unfortunately there doesn't seem to be a more pretty/pluggable way to this.
  ###
  module = origModuleMethod(name, reqs, configFn)

  if reqs

    if name is 'classy-core' then availablePlugins[name] = {}

    activeClassyPlugins = getActiveClassyPlugins(name, module)
        
    if activeClassyPlugins['classy-core']
      module.classy =
        plugin:
          controller: (plugin) -> availablePlugins[name] = plugin

        options:
          controller: {}

        activePlugins: activeClassyPlugins

        controller: (classObj) ->

          class classyController
            # `classyController` contains only a set of proxy functions for `classFns`,
            # this is because I suspect that performance is better this way.
            # TODO: Test performance to see if this is the most performant way to do it.

            # Pre-initialisation (before instance is created)
            classFns.preInit(@, classObj, module)

            # Initialisation (after instance is created)
            constructor: -> classFns.init(@, arguments, module)

        controllers: (controllerArray) ->
          # Accepts an array of controllers and returns the module, e.g.:
          # `module.classy.controllers([xxx, xxx]).config(xxx).run(xxx)`
          # Requested in issue #29
          for classObj in controllerArray
            @controller(classObj)
          return module

      module.cC = module.classy.controller
      module.cCs = module.classy.controllers

  return module


classFns =
  localInject: ['$q']

  preInit: (classConstructor, classObj, module) ->
    for own key, value of classObj
      classConstructor::[key] = value

    options =
      copyAndExtendDeep(
        {},
        module.__classyPluginDefaults,
        module.classy.options.controller,
        classObj.__options
      )

    classConstructor::__plugins = {}
    for pluginName, plugin of module.classy.activePlugins
      classConstructor::__plugins[pluginName] = angular.copy(plugin)
      classConstructor::__plugins[pluginName].classyOptions = options
      classConstructor::__plugins[pluginName].options = options[plugin.name] or {}

    pluginDo 'preInitBefore', [classConstructor, classObj, module]
    pluginDo 'preInit', [classConstructor, classObj, module]
    pluginDo 'preInitAfter', [classConstructor, classObj, module]

  init: (klass, $inject, module) ->
    injectIndex = 0
    deps = {}
    for key in klass.constructor.__classDepNames
      deps[key] = $inject[injectIndex]
      injectIndex++

    pluginDo 'null', [klass],
      before: (plugin) ->
        if angular.isArray(plugin.localInject)
          for depName in plugin.localInject
            dep = $inject[injectIndex]
            plugin[depName] = dep
            injectIndex++

    for depName in @localInject
      dep = $inject[injectIndex]
      @[depName] = dep
      injectIndex++

    pluginDo 'initBefore', [klass, deps, module]

    pluginPromises = []
    pluginDo 'init', [klass, deps, module],
      after: (plugin, returnVal) ->
        if returnVal?.then
          # Naively assume this is a promise
          pluginPromises.push(returnVal)

    initClass = ->
      klass.init?()
      pluginDo 'initAfter', [klass, deps, module]
      @postInit(klass, deps, module)

    if pluginPromises.length
      @$q.all(pluginPromises).then angular.bind(@, initClass)
    else
      angular.bind(@, initClass)()

  postInit: (klass, deps, module) ->
    pluginDo 'postInitBefore', [klass, deps, module]
    pluginDo 'postInit', [klass, deps, module]
    pluginDo 'postInitAfter', [klass, deps, module]

angular.module('classy-core', [])
angular.module('classy-bind-data', ['classy-core']).classy.plugin.controller
  # Based on @wuxiaoying's classy-initScope plugin
  name: 'bind-data'

  localInject: ['$parse']

  options:
    enabled: true
    addToScope: true
    privatePrefix: '_'
    keyName: 'data'
    
  hasPrivatePrefix: (string) ->
    prefix = @options.privatePrefix
    if !prefix then false
    else string.slice(0, prefix.length) is prefix

  init: (klass, deps, module) ->
    # Adds objects returned by or set to the `$scope`
    if @options.enabled and klass.constructor::[@options.keyName]

      data = angular.copy klass.constructor::[@options.keyName]

      if angular.isFunction data then data = data.call klass
      else if angular.isObject data
        for key, value of data
          if typeof value is 'string'
            getter = @$parse value
            data[key] = getter(klass)
          else
            data[key] = value


      for key, value of data
        klass[key] = value
        if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
          deps.$scope[key] = klass[key]

angular.module('classy-bind-dependencies', ['classy-core']).classy.plugin.controller
  name: 'bind-dependencies'

  options:
    enabled: true
    scopeShortcut: '$'
    useExistingNameString: '.'

  preInit: (classConstructor, classObj, module) ->
    depNames = classObj.inject or []

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(depNames) then @inject(classConstructor, depNames, module)

    # If `deps` is object: Wrap object in array and then inject
    else if angular.isObject(depNames) then @inject(classConstructor, [depNames], module)

  inject: (classConstructor, depNames, module) ->
    if angular.isObject depNames[0]
      classConstructor.__classyControllerInjectObject = depNames[0]
      depNames = (service for service, name of depNames[0])

    pluginDepNames = []
    for pluginName, plugin of module.classy.activePlugins
      if angular.isArray(plugin.localInject)
        pluginDepNames = pluginDepNames.concat(plugin.localInject)
    pluginDepNames = pluginDepNames.concat(classFns.localInject)

    classConstructor.__classDepNames = angular.copy depNames

    # Add the `deps` to the controller's $inject annotations.
    classConstructor.$inject = depNames.concat pluginDepNames

  initBefore: (klass, deps, module) ->
    if @options.enabled
      injectObject = klass.constructor.__classyControllerInjectObject

      # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
      for key, i in klass.constructor.$inject
        dependency = deps[key]

        # If the named dependency is assigned a name that is different from the original name
        if (injectObject and (injectName = injectObject[key]) and
            injectName != @options.useExistingNameString)
          klass[injectName] = dependency
        else
          klass[key] = dependency

          if key is '$scope' and @options.scopeShortcut
            # Add a shortcut to the $scope (by default `@$`)
            klass[@options.scopeShortcut] = klass[key]
angular.module('classy-bind-methods', ['classy-core']).classy.plugin.controller
  name: 'bind-methods'

  options:
    enabled: true
    addToScope: true
    privatePrefix: '_'
    ignore: ['constructor', 'init']
    keyName: 'methods'

  hasPrivatePrefix: (string) ->
    prefix = @options.privatePrefix
    if !prefix then false
    else string.slice(0, prefix.length) is prefix

  initBefore: (klass, deps, module) ->
    if @options.enabled
      # Adds controller functions (unless they have an `_` prefix) to the `$scope`
      for key, fn of klass.constructor::[@options.keyName]
        if angular.isFunction(fn) and !(key in @options.ignore)
          klass[key] = angular.bind(klass, fn)
          if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
            deps.$scope[key] = klass[key]
angular.module('classy-register', ['classy-core']).classy.plugin.controller
  name: 'register'

  options:
    enabled: true
    key: 'name'

  preInit: (classConstructor, classObj, module) ->
    if @options.enabled and angular.isString(classObj[@options.key])
        # Register the controller using name
        module.controller classObj[@options.key], classConstructor
angular.module('classy-watch', ['classy-core']).classy.plugin.controller
  name: 'watch'

  options:
    enabled: true
    _watchKeywords:
      normal: []
      objectEquality: ['{object}', '{deep}']
      collection: ['{collection}', '{shallow}']

  isActive: (klass, deps) ->
    if @options.enabled and angular.isObject(klass.watch)
      if !deps.$scope
        throw new Error "You need to inject `$scope` to use the watch object"
        return false

      return true

  watchFns:
    normal: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn))
    objectEquality: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn), true)
    collection: (klass, expression, fn, deps) ->
        deps.$scope.$watchCollection(expression, angular.bind(klass, fn))

  postInit: (klass, deps, module) ->
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

angular.module 'classy', ["classy-bind-data","classy-bind-dependencies","classy-bind-methods","classy-register","classy-watch"]