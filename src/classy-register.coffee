angular.module('classy-register', ['classy-core']).classy.plugin.controller
  name: 'registerSelector'

  preInit: (classConstructor, classObj, module) ->
    if angular.isString(classObj.name)
      # Register the controller using name
      module.controller classObj.name, classConstructor