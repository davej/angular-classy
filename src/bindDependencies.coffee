angular.module('classy.bindDependencies', ['classy.core']).classy.plugin.controller
  name: 'bindDependencies'

  options:
    enabled: true
    scopeShortcut: '$'

  preInit: (classConstructor, classObj, module) ->
    depNames = classObj.inject or []

    # Inject the `deps` if it's passed in as an array
    if angular.isArray(depNames) then @inject(classConstructor, depNames, module)

  inject: (classConstructor, depNames, module) ->
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
      # Takes the `$inject` dependencies and assigns a class-wide (`@`) variable to each one.
      for key, i in klass.constructor.$inject
        klass[key] = deps[key]

        if key is '$scope' and @options.scopeShortcut
          # Add a shortcut to the $scope (by default `@$`)
          klass[@options.scopeShortcut] = klass[key]