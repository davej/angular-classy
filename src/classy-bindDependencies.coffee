angular.module('classy-bindDependencies', ['classy-core']).classy.plugin.controller
  name: 'bindDependencies'

  options:
    enabled: true
    scopeShortcut: '$'
    useExistingNameString: '.'

  preInit: (classConstructor, classObj, module) ->
    depNames = classObj.inject or []

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(depNames) then @inject(classConstructor, depNames)

    # If `deps` is object: Wrap object in array and then inject
    else if angular.isObject(depNames) then @inject(classConstructor, [depNames], classObj)

  inject: (classConstructor, depNames, classObj) ->
    if angular.isObject depNames[0]
      classConstructor.__classyControllerInjectObject = depNames[0]
      depNames = (service for service, name of depNames[0])

    pluginDepNames = []
    for pluginName, plugin of enabledPlugins
      if angular.isArray(plugin.localInject)
        pluginDepNames = pluginDepNames.concat(plugin.localInject).concat(classFns.localInject)

    classConstructor.__classDepNames = angular.copy depNames

    # Add the `deps` to the controller's $inject annotations.
    classConstructor.$inject = depNames.concat pluginDepNames

  init: (klass, deps, module) ->
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