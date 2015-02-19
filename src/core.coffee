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