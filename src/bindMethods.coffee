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
