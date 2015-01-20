###
Angular Classy 1.0.0
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

availablePlugins = {}
alreadyRegisteredModules = {};

getActiveClassyPlugins = (name, origModule) ->
  obj = {}
  alreadyRegisteredModules[name] = true
  do getNextRequires = (name) ->
    if alreadyRegisteredModules[name]
      module = angular.module(name)
      for pluginName in module.requires
        plugin = availablePlugins[pluginName]
        if plugin
          obj[pluginName] = plugin
          plugin.name ?= pluginName.replace 'classy.', ''
          origModule.__classyDefaults ?= {}
          origModule.__classyDefaults[plugin.name] = angular.copy plugin.options or {}
        getNextRequires(pluginName)
    return

  return obj


pluginDo = (methodName, params, obj) ->
  plugins = params[0].__plugins or params[0]::__plugins
  for pluginName, plugin of plugins
    obj?.before?(plugin)
    returnVal = plugin[methodName]?.apply(plugin, params)
    obj?.after?(plugin, returnVal)
  return

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

    if name is 'classy.core' then availablePlugins[name] = {}

    activeClassyPlugins = getActiveClassyPlugins(name, module)
        
    if activeClassyPlugins['classy.core']
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
        module.__classyDefaults,
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
    return

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
        return

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
        return

    initClass = ->
      klass.init?()
      pluginDo 'initAfter', [klass, deps, module]
      @postInit(klass, deps, module)
      return

    if pluginPromises.length
      @$q.all(pluginPromises).then angular.bind(@, initClass)
    else
      angular.bind(@, initClass)()
    return

  postInit: (klass, deps, module) ->
    pluginDo 'postInitBefore', [klass, deps, module]
    pluginDo 'postInit', [klass, deps, module]
    pluginDo 'postInitAfter', [klass, deps, module]
    return

angular.module('classy.core', [])
angular.module('classy.bindData', ['classy.core']).classy.plugin.controller
  # Based on @wuxiaoying's classy-initScope plugin
  localInject: ['$parse']

  options:
    enabled: true
    addToScope: true
    addToClass: true
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
          if angular.isString(value)
            getter = @$parse value
            data[key] = getter(klass)
          else
            data[key] = value


      for key, value of data
        if @options.addToClass
          klass[key] = value
        if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
          deps.$scope[key] = value

    return

angular.module('classy.bindDependencies', ['classy.core']).classy.plugin.controller
  options:
    enabled: true
    scopeShortcut: '$'

  preInit: (classConstructor, classObj, module) ->
    depNames = classObj.inject or []

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(depNames) then @inject(classConstructor, depNames, module)
    return

  inject: (classConstructor, depNames, module) ->
    pluginDepNames = []
    for pluginName, plugin of module.classy.activePlugins
      if angular.isArray(plugin.localInject)
        pluginDepNames = pluginDepNames.concat(plugin.localInject)
    pluginDepNames = pluginDepNames.concat(classFns.localInject)

    classConstructor.__classDepNames = angular.copy depNames

    # Add the `deps` to the controller's $inject annotations.
    classConstructor.$inject = depNames.concat pluginDepNames

    return

  initBefore: (klass, deps, module) ->
    if @options.enabled
      # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
      for key, i in klass.constructor.$inject
        klass[key] = deps[key]

        if key is '$scope' and @options.scopeShortcut
          # Add a shortcut to the $scope (by default `@$`)
          klass[@options.scopeShortcut] = klass[key]
    return
angular.module('classy.bindMethods', ['classy.core']).classy.plugin.controller
  localInject: ['$parse'],

  options:
    enabled: true
    addToScope: true
    addToClass: true
    privatePrefix: '_'
    ignore: ['constructor', 'init']
    keyName: 'methods'

  hasPrivatePrefix: (string) ->
    prefix = @options.privatePrefix
    if !prefix then false
    else string.slice(0, prefix.length) is prefix

  init: (klass, deps, module) ->
    if @options.enabled
      for key, fn of klass.constructor::[@options.keyName]
        if angular.isFunction(fn) and !(key in @options.ignore)
          boundFn = angular.bind(klass, fn)
        else if angular.isString(fn)
          getter = @$parse fn
          boundFn = -> getter(klass);

        if angular.isFunction(boundFn)
          if @options.addToClass
            klass[key] = boundFn
          if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
            # Adds controller functions (unless they have an `_` prefix) to the `$scope`
            deps.$scope[key] = boundFn

    return

angular.module('classy.register', ['classy.core']).classy.plugin.controller
  options:
    enabled: true
    key: 'name'

  preInit: (classConstructor, classObj, module) ->
    if @options.enabled and angular.isString(classObj[@options.key])
        # Register the controller using name
        module.controller classObj[@options.key], classConstructor
    return
angular.module('classy.watch', ['classy.core']).classy.plugin.controller
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

    return

angular.module 'classy', ["classy.bindData","classy.bindDependencies","classy.bindMethods","classy.core","classy.register","classy.watch"]