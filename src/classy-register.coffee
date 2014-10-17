angular.module('classy-register', ['classy-core']).classy.plugin.controller
  name: 'register'

  options:
    enabled: true
    key: 'name'

  preInit: (classConstructor, classObj, module) ->
    if @options.enabled and angular.isString(classObj[@options.key])
        # Register the controller using name
        module.controller classObj[@options.key], classConstructor