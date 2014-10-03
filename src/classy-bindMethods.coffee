angular.module('classy-bindMethods', ['classy-core']).classy.plugin.controller
  name: 'bindMethods'

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