angular.module('classy-addFnsToScope', ['classy-core']).classy.plugin.controller
  name: 'addFnsToScope'

  options:
    enabled: true
    privateMethodPrefix: '_'
    ignore: ['constructor', 'init']

  hasPrivateMethodPrefix: (string) ->
    prefix = @options.privateMethodPrefix
    if !prefix then false
    else string.slice(0, prefix.length) is prefix

  init: (klass, deps, module) ->
    # Adds controller functions (unless they have a `_` prefix) to the `$scope`
    if @options.enabled
      for key, fn of klass.constructor::
        if angular.isFunction(fn) and !(key in @options.ignore)
          klass[key] = angular.bind(klass, fn)
          if !@hasPrivateMethodPrefix(key) and deps.$scope
            deps.$scope[key] = klass[key]