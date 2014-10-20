angular.module('classy-bind-data', ['classy-core']).classy.plugin.controller
  # Based on @wuxiaoying's classy-initScope plugin
  name: 'bind-data'

  localInject: ['$parse']

  options:
    enabled: true
    addToScope: true
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
          if typeof value is 'string'
            getter = @$parse value
            data[key] = getter(klass)
          else
            data[key] = value


      for key, value of data
        klass[key] = value
        if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
          deps.$scope[key] = klass[key]
