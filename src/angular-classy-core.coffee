###
Angular Classy 0.4.1
Dave Jeffery, @DaveJ
License: MIT
###

### global angular ###

'use strict';

defaults =
  controller: {}

selectorControllerCount = 0
availablePlugins = {}
enabledPlugins = {}

enablePlugins = (reqs) ->
  for req in reqs
    for pluginName, plugin of availablePlugins
      if pluginName is req
        enabledPlugins[pluginName] = plugin
        if plugin.options
          defaults.controller[plugin.name] = angular.copy(plugin.options)

pluginDo = (methodName, params, obj) ->
  for pluginName, plugin of enabledPlugins
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

  # This is super messy.
  # TODO: Clean this up and test the logic flow properly before moving to master
  if reqs
    enablePlugins(reqs)

    if 'classy-core' in reqs or 'classy' in reqs
      module.classy =
        plugin:
          controller: (plugin) -> availablePlugins[name] = plugin
        options:
          controller: {}

        controller: (classObj) ->

          class classyController
            # `classyController` contains only a set of proxy functions for `classFns`,
            # this is because I suspect that performance is better this way.
            # TODO: Test performance to see if this is the most performant way to do it.

            # Pre-initialisation (before instance is created)
            classFns.preInit(@, classObj, module)

            # Initialisation (after instance is created)
            constructor: -> classFns.init(@, arguments, module)

      module.cC = module.classy.controller

  return module


classFns =
  localInject: ['$q']

  preInit: (classConstructor, classObj, module) ->
    for own key, value of classObj
      classConstructor::[key] = value

    options =
      copyAndExtendDeep {}, defaults.controller, module.classy.options.controller, classObj.__options


    pluginDo 'preInitBefore', [classConstructor, classObj, module],
      before: (plugin) ->
        plugin.options = options[plugin.name] or {}
    pluginDo 'preInit', [classConstructor, classObj, module]
    pluginDo 'preInitAfter', [classConstructor, classObj, module]

  init: (klass, $inject, module) ->
    injectIndex = 0
    deps = {}
    for key in klass.constructor.__classDepNames
      deps[key] = $inject[injectIndex]
      injectIndex++

    pluginDo 'null', [],
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
        if returnVal && returnVal.then
          # Naively assume this is a promise
          # TODO: Make this smarter than just looking for `.then`
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