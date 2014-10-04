angular.module('classy-bindData', ['classy-core']).classy.plugin.controller
  # Based on @wuxiaoying's classy-initScope plugin
  name: 'bindData'

  options:
    addToScope: true
    privatePrefix: '_'
    enabled: true
    keyName: 'data'
    
  hasPrivatePrefix: (string) ->
    prefix = @options.privatePrefix
    if !prefix then false
    else string.slice(0, prefix.length) is prefix

  init: (klass, deps, module) ->
    # Adds objects returned by or set to the `$scope`
    if @options.enabled and klass.constructor::[@options.keyName]

      data = klass.constructor::[@options.keyName]
      if angular.isFunction data then data = data.call klass

      for key, value of data
        klass[key] = value
        if @options.addToScope and !@hasPrivatePrefix(key) and deps.$scope
          deps.$scope[key] = klass[key]
